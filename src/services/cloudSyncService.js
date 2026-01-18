import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  writeBatch
} from 'firebase/firestore';
import { firestore } from '../config/firebase';
import { db } from '../db/database';

const TABLE_NAMES = [
  'transactions',
  'creditCards',
  'investments',
  'pockets',
  'pocketMovements',
  'settings'
];

const TABLE_OBJECTS = {
  transactions: db.transactions,
  creditCards: db.creditCards,
  investments: db.investments,
  pockets: db.pockets,
  pocketMovements: db.pocketMovements,
  settings: db.settings
};

const MAX_BATCH_OPERATIONS = 400;

function sanitizeItem(item) {
  if (!item) return item;
  return JSON.parse(JSON.stringify(item));
}

function getDocIdForCollection(collectionName, item) {
  if (collectionName === 'settings') {
    return String(item.key);
  }
  if (item.id === undefined || item.id === null) {
    throw new Error(`Elemento sin id para la colección ${collectionName}`);
  }
  return String(item.id);
}

function normalizeFirestoreValue(value) {
  if (!value) return value;
  if (typeof value.toDate === 'function') {
    return value.toDate().toISOString();
  }
  if (Array.isArray(value)) {
    return value.map(normalizeFirestoreValue);
  }
  if (typeof value === 'object') {
    return Object.keys(value).reduce((acc, key) => {
      acc[key] = normalizeFirestoreValue(value[key]);
      return acc;
    }, {});
  }
  return value;
}

export async function getLocalDataSnapshot() {
  const snapshot = {};

  await Promise.all(
    TABLE_NAMES.map(async (name) => {
      const table = TABLE_OBJECTS[name];
      const items = await table.toArray();
      snapshot[name] = items.map(sanitizeItem);
    })
  );

  return snapshot;
}

export async function getLocalDataSummary() {
  const counts = {};
  let total = 0;

  await Promise.all(
    TABLE_NAMES.map(async (name) => {
      const table = TABLE_OBJECTS[name];
      const count = await table.count();
      counts[name] = count;
      total += count;
    })
  );

  return { counts, total };
}

export async function hasLocalData() {
  const summary = await getLocalDataSummary();
  return summary.total > 0;
}

export async function replaceLocalData(snapshot = {}) {
  await db.transaction(
    'rw',
    TABLE_OBJECTS.transactions,
    TABLE_OBJECTS.creditCards,
    TABLE_OBJECTS.investments,
    TABLE_OBJECTS.pockets,
    TABLE_OBJECTS.pocketMovements,
    TABLE_OBJECTS.settings,
    async () => {
      await Promise.all(TABLE_NAMES.map((name) => TABLE_OBJECTS[name].clear()));

      for (const name of TABLE_NAMES) {
        const items = snapshot[name] || [];
        if (items.length === 0) continue;
        await TABLE_OBJECTS[name].bulkPut(items);
      }
    }
  );
}

async function commitOperations(operations) {
  for (let i = 0; i < operations.length; i += MAX_BATCH_OPERATIONS) {
    const batch = writeBatch(firestore);
    const chunk = operations.slice(i, i + MAX_BATCH_OPERATIONS);

    chunk.forEach((operation) => {
      if (operation.type === 'set') {
        batch.set(operation.ref, operation.data);
      } else if (operation.type === 'delete') {
        batch.delete(operation.ref);
      }
    });

    await batch.commit();
  }
}

async function syncCollection(uid, collectionName, items = []) {
  const colRef = collection(firestore, 'users', uid, collectionName);
  const existingDocs = await getDocs(colRef);
  const targetIds = new Set(
    items.map((item) => getDocIdForCollection(collectionName, item))
  );

  const operations = [];

  existingDocs.forEach((docSnap) => {
    if (!targetIds.has(docSnap.id)) {
      operations.push({ type: 'delete', ref: docSnap.ref });
    }
  });

  items.forEach((item) => {
    const docId = getDocIdForCollection(collectionName, item);
    const docRef = doc(firestore, 'users', uid, collectionName, docId);
    operations.push({
      type: 'set',
      ref: docRef,
      data: sanitizeItem({ ...item })
    });
  });

  if (operations.length > 0) {
    await commitOperations(operations);
  }
}

export async function uploadSnapshotToCloud(uid, snapshot = {}) {
  if (!uid) throw new Error('Usuario no autenticado');

  for (const name of TABLE_NAMES) {
    await syncCollection(uid, name, snapshot[name] || []);
  }

  await setDoc(
    doc(firestore, 'users', uid),
    {
      hasData: true,
      lastSync: serverTimestamp()
    },
    { merge: true }
  );
}

export async function fetchCloudData(uid) {
  if (!uid) return {};

  const data = {};

  await Promise.all(
    TABLE_NAMES.map(async (name) => {
      const colRef = collection(firestore, 'users', uid, name);
      const snapshot = await getDocs(colRef);
      data[name] = snapshot.docs.map((docSnap) =>
        normalizeFirestoreValue(docSnap.data())
      );
    })
  );

  return data;
}

export async function cloudHasData(uid) {
  if (!uid) return false;

  const metaRef = doc(firestore, 'users', uid);
  const metaSnap = await getDoc(metaRef);

  if (metaSnap.exists() && metaSnap.data()?.hasData) {
    return true;
  }

  const transactionsRef = collection(firestore, 'users', uid, 'transactions');
  const q = query(transactionsRef, limit(1));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

export function trackLocalChanges(onChange) {
  const unsubscribers = [];

  TABLE_NAMES.forEach((name) => {
    const table = TABLE_OBJECTS[name];
    if (!table) return;

    const handleChange = () => onChange(name);

    table.hook('creating', handleChange);
    table.hook('updating', handleChange);
    table.hook('deleting', handleChange);

    unsubscribers.push(() => table.hook('creating').unsubscribe(handleChange));
    unsubscribers.push(() => table.hook('updating').unsubscribe(handleChange));
    unsubscribers.push(() => table.hook('deleting').unsubscribe(handleChange));
  });

  return () => {
    unsubscribers.forEach((unsub) => unsub());
  };
}
