// ============================================
// database.js — IndexedDB Engine (FIXED)
// ============================================

const DB_NAME = 'TaskAheadDB';
const DB_VERSION = 4; // Bumped to force clean store creation

const db = {
  instance: null,

  init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.instance = request.result;
        // Handle version changes from other tabs
        this.instance.onversionchange = () => {
          this.instance.close();
          location.reload();
        };
        resolve(this.instance);
      };

      request.onblocked = () => {
        reject(new Error('Database blocked. Please close other tabs using this app and reload.'));
      };

      request.onupgradeneeded = (event) => {
        const database = event.target.result;

        if (!database.objectStoreNames.contains('users')) {
          const userStore = database.createObjectStore('users', { keyPath: 'username' });
          userStore.createIndex('email', 'email', { unique: true });
        }

        if (!database.objectStoreNames.contains('tasks')) {
          const taskStore = database.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
          taskStore.createIndex('userId', 'userId', { unique: false });
          taskStore.createIndex('status', 'status', { unique: false });
        }

        if (!database.objectStoreNames.contains('gamification')) {
          database.createObjectStore('gamification', { keyPath: 'userId' });
        }

        if (!database.objectStoreNames.contains('profiles')) {
          database.createObjectStore('profiles', { keyPath: 'userId' });
        }

        if (!database.objectStoreNames.contains('schedules')) {
          database.createObjectStore('schedules', { keyPath: 'userId' });
        }
        if (!database.objectStoreNames.contains('subjects')) {
          database.createObjectStore('subjects', { keyPath: 'userId' });
        }
      };
    });
  },

  add(storeName, data) {
    return new Promise((resolve, reject) => {
      const tx = this.instance.transaction(storeName, 'readwrite');
      tx.onerror = () => reject(tx.error);
      const store = tx.objectStore(storeName);
      const request = store.add(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  get(storeName, key) {
    return new Promise((resolve, reject) => {
      const tx = this.instance.transaction(storeName, 'readonly');
      tx.onerror = () => reject(tx.error);
      const store = tx.objectStore(storeName);
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  getAll(storeName) {
    return new Promise((resolve, reject) => {
      const tx = this.instance.transaction(storeName, 'readonly');
      tx.onerror = () => reject(tx.error);
      const store = tx.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  put(storeName, data) {
    return new Promise((resolve, reject) => {
      const tx = this.instance.transaction(storeName, 'readwrite');
      tx.onerror = () => reject(tx.error);
      const store = tx.objectStore(storeName);
      const request = store.put(data);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  delete(storeName, key) {
    return new Promise((resolve, reject) => {
      const tx = this.instance.transaction(storeName, 'readwrite');
      tx.onerror = () => reject(tx.error);
      const store = tx.objectStore(storeName);
      const request = store.delete(key);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
};
