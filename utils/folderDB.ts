/**
 * IndexedDB persistence for FileSystemDirectoryHandle.
 * Stores the user's chosen folder handle so it survives page refreshes and reboots.
 * On a new device, the user picks the same OneDrive folder and the handle is saved again.
 */

const DB_NAME = 'mattemonitor-settings';
const DB_VERSION = 1;
const STORE_NAME = 'folder-handles';
const HANDLE_KEY = 'primary-data-folder';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save a FileSystemDirectoryHandle to IndexedDB.
 * This persists the user's folder choice across sessions.
 */
export async function saveFolderHandle(handle: FileSystemDirectoryHandle): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(handle, HANDLE_KEY);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

/**
 * Load the saved FileSystemDirectoryHandle from IndexedDB.
 * Returns null if no handle was saved.
 */
export async function loadFolderHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const request = tx.objectStore(STORE_NAME).get(HANDLE_KEY);
      request.onsuccess = () => { db.close(); resolve(request.result || null); };
      request.onerror = () => { db.close(); reject(request.error); };
    });
  } catch {
    return null;
  }
}

/**
 * Remove the saved folder handle from IndexedDB.
 */
export async function clearFolderHandle(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(HANDLE_KEY);
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}

/**
 * Verify that a saved handle is still valid and we have permission.
 * Returns the handle if valid, null otherwise.
 * May trigger a browser permission prompt.
 */
export async function verifyFolderHandle(
  handle: FileSystemDirectoryHandle
): Promise<FileSystemDirectoryHandle | null> {
  try {
    // Check if we still have permission
    // @ts-ignore - queryPermission may not be in all TS defs
    const readPerm = await handle.queryPermission({ mode: 'readwrite' });
    if (readPerm === 'granted') return handle;

    // Try to request permission (will show browser prompt)
    // @ts-ignore
    const requestPerm = await handle.requestPermission({ mode: 'readwrite' });
    if (requestPerm === 'granted') return handle;

    return null;
  } catch {
    return null;
  }
}
