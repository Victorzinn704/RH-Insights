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
const handlers = require('../lib/index.js');
intervalMock.mock.restore();

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
