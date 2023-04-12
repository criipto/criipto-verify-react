
export function createMemoryStorage() : Storage {
  let store : {[key: string]: string} = {};

  return {
    getItem(key: string) {
      return store[key] || null;
    },
    setItem(key: string, value: any) {
      store[key] = value.toString();
    },
    removeItem(key: string) {
      delete store[key];
    },
    clear() {
      store = {};
    },
    key(index) {
      return Object.keys(store)[index];
    },
    get length() {
      return Object.keys(store).length;
    }
  };
}