const storageMock = () => {
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
    }
  };
};

export default async function () {
  global.sessionStorage = storageMock() as any;
}