export type JournalPhoto = {
  id: string;
  dataUrl: string;
  date: string; // 'YYYY-MM-DD'
  timestamp: number;
  note?: string;
};

const DB_NAME = "bodywise_journal_db";
const DB_VERSION = 1;
const STORE_NAME = "photos";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not available in this environment."));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("date", "date", { unique: false });
        store.createIndex("timestamp", "timestamp", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Failed to open IndexedDB"));
  });
}

export async function saveJournalPhoto(
  dataUrl: string,
  date: string,
  note?: string
): Promise<JournalPhoto> {
  const db = await openDatabase();
  const photo: JournalPhoto = {
    id: `photo_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    dataUrl,
    date,
    timestamp: Date.now(),
    note: note?.trim(),
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.add(photo);

    request.onsuccess = () => resolve(photo);
    request.onerror = () => reject(request.error || new Error("Failed to save photo."));
  });
}

export async function getJournalPhotos(): Promise<JournalPhoto[]> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const results: JournalPhoto[] = request.result || [];
      // Sort newest first
      results.sort((a, b) => b.timestamp - a.timestamp);
      resolve(results);
    };
    request.onerror = () => reject(request.error || new Error("Failed to retrieve photos."));
  });
}

export async function deleteJournalPhoto(id: string): Promise<boolean> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error || new Error("Failed to delete photo."));
  });
}

export async function clearAllJournalPhotos(): Promise<boolean> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve(true);
    request.onerror = () => reject(request.error || new Error("Failed to clear photos."));
  });
}
