import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  setDoc,
  query,
  where,
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import { firestore } from '../config/firebase';

// ─── Helpers ─────────────────────────────────────────────────

const MAX_BATCH = 400;

function userCol(uid, name) {
  return collection(firestore, 'users', uid, name);
}

function userDocRef(uid, name, id) {
  return doc(firestore, 'users', uid, name, String(id));
}

/** Normalize Firestore Timestamps to ISO strings recursively */
function normalize(data) {
  if (!data) return data;
  if (typeof data?.toDate === 'function') return data.toDate().toISOString();
  if (Array.isArray(data)) return data.map(normalize);
  if (typeof data === 'object' && data !== null) {
    const result = {};
    for (const key of Object.keys(data)) {
      result[key] = normalize(data[key]);
    }
    return result;
  }
  return data;
}

function snapToArray(snapshot) {
  return snapshot.docs.map(d => normalize({ ...d.data(), id: d.id }));
}

async function batchDeleteDocs(refs) {
  for (let i = 0; i < refs.length; i += MAX_BATCH) {
    const batch = writeBatch(firestore);
    refs.slice(i, i + MAX_BATCH).forEach(ref => batch.delete(ref));
    await batch.commit();
  }
}

// ─── TRANSACTIONS ────────────────────────────────────────────

export async function addTransaction(uid, data) {
  const ref = await addDoc(userCol(uid, 'transactions'), data);
  return ref.id;
}

export async function updateTransaction(uid, id, updates) {
  await updateDoc(userDocRef(uid, 'transactions', id), updates);
}

export async function deleteTransaction(uid, id) {
  await deleteDoc(userDocRef(uid, 'transactions', id));
}

/** Subscribe to transactions within a specific month */
export function subscribeTransactionsByMonth(uid, year, month, callback, onError) {
  const startDate = new Date(year, month, 1).toISOString();
  const endDate = new Date(year, month + 1, 0, 23, 59, 59).toISOString();

  const q = query(
    userCol(uid, 'transactions'),
    where('date', '>=', startDate),
    where('date', '<=', endDate)
  );

  return onSnapshot(
    q,
    snap => {
      const items = snapToArray(snap);
      items.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      callback(items);
    },
    onError
  );
}

/** Subscribe to ALL transactions up to a date (for accumulated balance) */
export function subscribeTransactionsUpTo(uid, endDateISO, callback, onError) {
  const q = query(
    userCol(uid, 'transactions'),
    where('date', '<=', endDateISO)
  );
  return onSnapshot(q, snap => callback(snapToArray(snap)), onError);
}

/** Subscribe to ALL transactions (for credit card balance calculations) */
export function subscribeAllTransactions(uid, callback, onError) {
  return onSnapshot(
    userCol(uid, 'transactions'),
    snap => callback(snapToArray(snap)),
    onError
  );
}

// ─── CREDIT CARDS ────────────────────────────────────────────

export async function addCreditCard(uid, data) {
  const ref = await addDoc(userCol(uid, 'creditCards'), data);
  return ref.id;
}

export async function updateCreditCard(uid, id, updates) {
  await updateDoc(userDocRef(uid, 'creditCards', id), updates);
}

export async function deleteCreditCard(uid, id) {
  const refsToDelete = [];

  const txSnap = await getDocs(userCol(uid, 'transactions'));
  txSnap.forEach(d => {
    if (String(d.data().creditCardId) === String(id)) {
      refsToDelete.push(d.ref);
    }
  });

  const trSnap = await getDocs(userCol(uid, 'transfers'));
  trSnap.forEach(d => {
    if (String(d.data().creditCardId) === String(id)) {
      refsToDelete.push(d.ref);
    }
  });

  refsToDelete.push(userDocRef(uid, 'creditCards', id));
  await batchDeleteDocs(refsToDelete);
}

export function subscribeCreditCards(uid, callback, onError) {
  return onSnapshot(
    userCol(uid, 'creditCards'),
    snap => {
      const items = snapToArray(snap);
      items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      callback(items);
    },
    onError
  );
}

// ─── INVESTMENTS ─────────────────────────────────────────────

export async function addInvestment(uid, data) {
  const ref = await addDoc(userCol(uid, 'investments'), data);
  return ref.id;
}

export async function updateInvestment(uid, id, updates) {
  await updateDoc(userDocRef(uid, 'investments', id), updates);
}

export async function deleteInvestment(uid, id) {
  await deleteDoc(userDocRef(uid, 'investments', id));
}

export function subscribeInvestments(uid, callback, onError) {
  return onSnapshot(
    userCol(uid, 'investments'),
    snap => {
      const items = snapToArray(snap);
      items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      callback(items);
    },
    onError
  );
}

// ─── POCKETS ─────────────────────────────────────────────────

export async function addPocket(uid, data) {
  const ref = await addDoc(userCol(uid, 'pockets'), data);
  return ref.id;
}

export async function updatePocket(uid, id, updates) {
  await updateDoc(userDocRef(uid, 'pockets', id), updates);
}

export async function deletePocket(uid, id) {
  const refsToDelete = [];

  const movSnap = await getDocs(userCol(uid, 'pocketMovements'));
  movSnap.forEach(d => {
    if (String(d.data().pocketId) === String(id)) {
      refsToDelete.push(d.ref);
    }
  });

  refsToDelete.push(userDocRef(uid, 'pockets', id));
  await batchDeleteDocs(refsToDelete);
}

export function subscribePockets(uid, callback, onError) {
  return onSnapshot(
    userCol(uid, 'pockets'),
    snap => {
      const items = snapToArray(snap);
      items.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
      callback(items);
    },
    onError
  );
}

// ─── POCKET MOVEMENTS ────────────────────────────────────────

export async function addPocketMovement(uid, data) {
  const ref = await addDoc(userCol(uid, 'pocketMovements'), data);
  return ref.id;
}

export function subscribePocketMovements(uid, callback, onError) {
  return onSnapshot(
    userCol(uid, 'pocketMovements'),
    snap => {
      const items = snapToArray(snap);
      items.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      callback(items);
    },
    onError
  );
}

// ─── SETTINGS ────────────────────────────────────────────────

export async function getSetting(uid, key) {
  const snap = await getDoc(userDocRef(uid, 'settings', key));
  return snap.exists() ? normalize(snap.data()) : null;
}

export async function putSetting(uid, key, data) {
  await setDoc(userDocRef(uid, 'settings', key), { ...data, key });
}

export function subscribeSetting(uid, key, callback, onError) {
  return onSnapshot(
    userDocRef(uid, 'settings', key),
    snap => callback(snap.exists() ? normalize(snap.data()) : null),
    onError
  );
}

// ─── TRANSFERS ───────────────────────────────────────────────

export async function addTransfer(uid, data) {
  const ref = await addDoc(userCol(uid, 'transfers'), data);
  return ref.id;
}

export async function deleteTransfer(uid, id) {
  await deleteDoc(userDocRef(uid, 'transfers', id));
}

export function subscribeTransfers(uid, callback, onError) {
  return onSnapshot(
    userCol(uid, 'transfers'),
    snap => {
      const items = snapToArray(snap);
      items.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
      callback(items);
    },
    onError
  );
}

/** One-shot query: get transactions by date range (for AI reports) */
export async function getTransactionsByDateRange(uid, startYear, startMonth, endYear, endMonth) {
  const startDate = new Date(startYear, startMonth, 1).toISOString();
  const endDate = new Date(endYear, endMonth + 1, 0, 23, 59, 59).toISOString();

  const q = query(
    userCol(uid, 'transactions'),
    where('date', '>=', startDate),
    where('date', '<=', endDate)
  );

  const snap = await getDocs(q);
  const items = snapToArray(snap);
  items.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  return items;
}

/** Subscribe to all transfers up to a date (for accumulated balance) */
export function subscribeTransfersUpTo(uid, endDateISO, callback, onError) {
  const q = query(
    userCol(uid, 'transfers'),
    where('date', '<=', endDateISO)
  );
  return onSnapshot(q, snap => callback(snapToArray(snap)), onError);
}
