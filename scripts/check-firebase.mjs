import assert from 'node:assert/strict';
import { initializeApp, deleteApp } from 'firebase/app';
import {
  collection, disableNetwork, doc, getDocFromCache, getFirestore,
  orderBy, query, terminate, where,
} from 'firebase/firestore';

// Load the real Node SDK (and its gRPC dependency) without credentials or I/O.
const app = initializeApp({ projectId: 'offline-dependency-check' }, 'dependency-check');
const db = getFirestore(app);
try {
  await disableNetwork(db);
  const employees = collection(db, 'employees');
  const employee = doc(employees, 'dependency-check');
  assert.equal(employee.path, 'employees/dependency-check');
  assert.equal(query(employees, where('active', '==', true), orderBy('name')).type, 'query');
  await assert.rejects(getDocFromCache(employee), { code: 'unavailable' });
} finally {
  await terminate(db);
  await deleteApp(app);
}
process.stdout.write('Firebase Node import and offline Firestore checks passed.\n');
