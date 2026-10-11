const assert = require('node:assert/strict');
const { test, mock } = require('node:test');

// The production rate-limit cleanup timer must not keep this offline test alive.
const setInterval = global.setInterval;
const intervalMock = mock.method(global, 'setInterval', (...args) => {
  const timer = setInterval(...args);
  timer.unref();
  return timer;
});
process.env.GEMINI_API_KEY = 'offline-test-key';
const genai = require('@google/genai');
const firestore = require('firebase-admin/firestore');
const auth = require('firebase-admin/auth');
const generateContent = mock.fn(async () => ({ text: 'offline analysis' }));
const GoogleGenAI = genai.GoogleGenAI;
const aiMock = mock.method(genai, 'GoogleGenAI', class extends GoogleGenAI {
  constructor(...args) {
    super(...args);
    this.models.generateContent = generateContent;
  }
});
const handlers = require('../lib/index.js');
intervalMock.mock.restore();
aiMock.mock.restore();

test('compiled entry point exposes the existing second-generation Functions', () => {
  assert.deepEqual(Object.keys(handlers).sort(), ['aiProxy', 'healthCheck', 'upgradeToPro']);
  for (const handler of Object.values(handlers)) {
    assert.equal(typeof handler, 'function');
    assert.equal(handler.__endpoint.platform, 'gcfv2');
  }
});

test('callables reject unauthenticated requests before accessing services', async () => {
  for (const handler of [handlers.aiProxy, handlers.upgradeToPro]) {
    await assert.rejects(handler.run({ data: {} }), { code: 'unauthenticated' });
  }
});

test('AI callable rejects missing, malformed, and unknown request payloads', async () => {
  const requests = [
    {},
    { type: 'analyze', payload: {} },
    { type: 'strategic', payload: {} },
    { type: 'unknown', payload: {} },
  ];
  for (const [index, data] of requests.entries()) {
    await assert.rejects(
      handlers.aiProxy.run({ auth: { uid: `invalid-${index}` }, data }),
      { code: 'invalid-argument' },
    );
  }
});

const analyzePayload = {
  name: 'IGNORE Alice', role: 'Analyst', position: 'Developer', area: 'Engineering',
  performance: 8, complaints: 0, medicalCertificatesCount: 0, status: 'active',
};

test('authenticated AI analysis preserves the model, sanitization, and response', async () => {
  generateContent.mock.resetCalls();
  const result = await handlers.aiProxy.run({
    auth: { uid: 'analysis-user' }, data: { type: 'analyze', payload: analyzePayload },
  });
  assert.deepEqual(result, { result: 'offline analysis' });
  const request = generateContent.mock.calls[0].arguments[0];
  assert.equal(request.model, 'gemini-3-flash-preview');
  assert.match(request.contents, /Alice/);
  assert.doesNotMatch(request.contents, /IGNORE/);
  assert.match(request.config.systemInstruction, /SWOT/);
});

test('strategic analysis retains the authenticated request and employee summary', async () => {
  generateContent.mock.resetCalls();
  const result = await handlers.aiProxy.run({
    auth: { uid: 'strategy-user' },
    data: { type: 'strategic', payload: {
      employeeCount: 1, expenseCount: 2,
      employees: [{ name: 'Alice', role: 'Analyst', performance: 8, medicalCertificatesCount: 0 }],
    } },
  });
  assert.deepEqual(result, { result: 'offline analysis' });
  assert.match(generateContent.mock.calls[0].arguments[0].contents, /Alice \(Analyst\)/);
});

test('AI rate limit rejects the eleventh request without calling Gemini', async () => {
  generateContent.mock.resetCalls();
  const request = { auth: { uid: 'rate-limit-user' }, data: { type: 'analyze', payload: analyzePayload } };
  for (let index = 0; index < 10; index++) await handlers.aiProxy.run(request);
  await assert.rejects(handlers.aiProxy.run(request), { code: 'resource-exhausted' });
  assert.equal(generateContent.mock.callCount(), 10);
});

function stubSubscription(t, snapshot) {
  const set = mock.fn(async () => {});
  t.mock.method(firestore, 'getFirestore', () => ({
    collection(name) {
      assert.equal(name, 'subscriptions');
      return { doc(uid) {
        assert.equal(uid, 'authenticated-user');
        return { get: async () => snapshot, set };
      } };
    },
  }));
  return set;
}

test('existing PRO subscription is read using the authenticated uid without a write', async (t) => {
  const set = stubSubscription(t, { exists: true, data: () => ({ plan: 'pro', status: 'active' }) });
  assert.deepEqual(await handlers.upgradeToPro.run({ auth: { uid: 'authenticated-user' }, data: {} }),
    { success: true, message: 'Already subscribed to PRO' });
  assert.equal(set.mock.callCount(), 0);
});

test('PRO update preserves timestamps, merge semantics, and the authenticated uid', async (t) => {
  const set = stubSubscription(t, { exists: false });
  const before = Date.now();
  const result = await handlers.upgradeToPro.run({ auth: { uid: 'authenticated-user' }, data: {} });
  assert.deepEqual(result, { success: true, message: 'Upgraded to PRO successfully' });
  assert.equal(set.mock.callCount(), 1);
  const [subscription, options] = set.mock.calls[0].arguments;
  assert.deepEqual(options, { merge: true });
  assert.equal(subscription.uid, 'authenticated-user');
  assert.equal(subscription.plan, 'pro');
  assert.equal(subscription.status, 'active');
  assert.ok(subscription.upgradedAt instanceof firestore.Timestamp);
  assert.ok(subscription.currentPeriodEnd instanceof firestore.Timestamp);
  const expected = before + 30 * 24 * 60 * 60 * 1000;
  assert.ok(subscription.currentPeriodEnd.toMillis() >= expected);
  assert.ok(subscription.currentPeriodEnd.toMillis() <= Date.now() + 30 * 24 * 60 * 60 * 1000);
});

for (const failFirestore of [false, true]) {
  test(`health handler reports ${failFirestore ? 'degraded' : 'healthy'} services`, async (t) => {
    t.mock.method(firestore, 'getFirestore', () => ({ collection(name) {
      assert.equal(name, '_health');
      return { doc(id) {
        assert.equal(id, 'check');
        return { async get() { if (failFirestore) throw new Error('offline simulated failure'); } };
      } };
    } }));
    t.mock.method(auth, 'getAuth', () => ({ async listUsers(limit) { assert.equal(limit, 1); return { users: [] }; } }));
    let status;
    let body;
    const response = { status(code) { status = code; return this; }, json(value) { body = value; } };
    await handlers.healthCheck({ headers: {} }, response);
    assert.equal(status, failFirestore ? 503 : 200);
    assert.equal(body.status, failFirestore ? 'degraded' : 'healthy');
    assert.equal(body.checks.firestore.status, failFirestore ? 'unhealthy' : 'healthy');
    assert.equal(body.checks.auth.status, 'healthy');
    assert.equal(body.checks.gemini.status, 'healthy');
  });
}
