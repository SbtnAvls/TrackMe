import Dexie from 'dexie';

// Dexie schema - kept only for legacy data migration.
// After all users migrate, this file and the dexie dependency can be removed.

export const db = new Dexie('ExpenseTrackerDB');

db.version(1).stores({
  transactions: '++id, type, category, date, createdAt'
});

db.version(2).stores({
  transactions: '++id, type, category, date, createdAt',
  creditCards: '++id, bank, createdAt'
});

db.version(3).stores({
  transactions: '++id, type, category, date, createdAt, creditCardId',
  creditCards: '++id, bank, createdAt'
});

db.version(4).stores({
  transactions: '++id, type, category, date, createdAt, creditCardId',
  creditCards: '++id, bank, debtType, createdAt'
});

db.version(5).stores({
  transactions: '++id, type, category, date, createdAt, creditCardId',
  creditCards: '++id, bank, debtType, createdAt',
  settings: 'key'
});

db.version(6).stores({
  transactions: '++id, type, category, date, createdAt, creditCardId',
  creditCards: '++id, bank, debtType, createdAt',
  settings: 'key',
  investments: '++id, type, symbol, createdAt'
});

db.version(7).stores({
  transactions: '++id, type, category, date, createdAt, creditCardId',
  creditCards: '++id, bank, debtType, createdAt',
  settings: 'key',
  investments: '++id, type, symbol, createdAt',
  pockets: '++id, name, category, createdAt',
  pocketMovements: '++id, pocketId, type, date'
});

db.version(8).stores({
  transactions: '++id, type, category, date, createdAt, creditCardId',
  creditCards: '++id, bank, debtType, createdAt',
  settings: 'key',
  investments: '++id, type, symbol, createdAt',
  pockets: '++id, name, category, createdAt',
  pocketMovements: '++id, pocketId, type, date',
  transfers: '++id, type, date, createdAt, creditCardId'
});
