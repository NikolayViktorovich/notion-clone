import '@testing-library/jest-dom';

Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'mock-uuid-' + Math.random().toString(36).substr(2, 9),
  },
});

const indexedDB = {
  open: jest.fn(() => ({
    onupgradeneeded: null,
    onsuccess: null,
    onerror: null,
    result: {
      createObjectStore: jest.fn(),
      transaction: jest.fn(() => ({
        objectStore: jest.fn(() => ({
          get: jest.fn(() => ({
            onsuccess: null,
            onerror: null,
          })),
          put: jest.fn(() => ({
            onsuccess: null,
            onerror: null,
          })),
          delete: jest.fn(() => ({
            onsuccess: null,
            onerror: null,
          })),
        })),
      })),
    },
  })),
};

Object.defineProperty(global, 'indexedDB', {
  value: indexedDB,
});

Object.defineProperty(global, 'IDBRequest', {
  value: class IDBRequest {
    onsuccess = null;
    onerror = null;
  },
});

Object.defineProperty(global, 'IDBDatabase', {
  value: class IDBDatabase {
    createObjectStore = jest.fn();
    transaction = jest.fn();
  },
});

Object.defineProperty(global, 'IDBTransaction', {
  value: class IDBTransaction {
    objectStore = jest.fn();
  },
});

Object.defineProperty(global, 'IDBObjectStore', {
  value: class IDBObjectStore {
    get = jest.fn();
    put = jest.fn();
    delete = jest.fn();
  },
});

jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => children,
  Routes: ({ children }: { children: React.ReactNode }) => children,
  Route: ({ children }: { children: React.ReactNode }) => children,
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/' }),
}));

jest.mock('superjson', () => ({
  stringify: (data: any) => JSON.stringify(data),
  parse: (data: string) => JSON.parse(data),
}));

jest.mock('googleapis', () => ({
  google: {
    auth: {
      OAuth2: jest.fn(),
    },
    drive: jest.fn(() => ({
      files: {
        list: jest.fn(),
        get: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    })),
  },
}));