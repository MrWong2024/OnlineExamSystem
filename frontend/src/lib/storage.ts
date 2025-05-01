// src/lib/storage.ts

export function createStorage(storage: Storage) {
  return {
    get(key: string): string | null {
      return storage.getItem(key);
    },
    set(key: string, value: string): void {
      storage.setItem(key, value);
    },
    remove(key: string): void {
      storage.removeItem(key);
    },
  };
}
  
let local: ReturnType<typeof createStorage> | null = null;
let session: ReturnType<typeof createStorage> | null = null;

export function getLocal() {
  if (typeof window === "undefined") {
    throw new Error("getLocal() should only be called in browser environment.");
  }
  if (!local) {
    local = createStorage(window.localStorage);
  }
  return local;
}

export function getSession() {
  if (typeof window === "undefined") {
    throw new Error("getSession() should only be called in browser environment.");
  }
  if (!session) {
    session = createStorage(window.sessionStorage);
  }
  return session;
}
  