// Setup file to ensure localStorage works correctly in all tests.
// Vitest's jsdom sometimes provides a broken localStorage implementation.

const store = new Map<string, string>();

const localStorageMock: Storage = {
    getItem(key: string): string | null {
        return store.get(key) ?? null;
    },
    setItem(key: string, value: string): void {
        store.set(key, value);
    },
    removeItem(key: string): void {
        store.delete(key);
    },
    clear(): void {
        store.clear();
    },
    get length(): number {
        return store.size;
    },
    key(index: number): string | null {
        const keys = Array.from(store.keys());
        return keys[index] ?? null;
    },
};

Object.defineProperty(globalThis, 'localStorage', {
    value: localStorageMock,
    writable: true,
    configurable: true,
});
