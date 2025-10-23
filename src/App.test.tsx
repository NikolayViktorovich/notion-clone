import { render } from '@testing-library/react';
import App from './App';

jest.mock('./store/useStore', () => ({
  useStore: () => ({
    currentPage: null,
    workspaces: [],
    isLoading: false,
    
    initializeApp: jest.fn(),
    initializeOffline: jest.fn(),
    createPage: jest.fn(),
    updatePage: jest.fn(),
    deletePage: jest.fn(),
    createBlock: jest.fn(),
    updateBlock: jest.fn(),
    deleteBlock: jest.fn(),
    moveBlock: jest.fn(),
    offlineStatus: {
      isOnline: true,
      lastSync: null,
    },
    forceSync: jest.fn(),
    
    theme: 'light',
    setTheme: jest.fn(),
  }),
}));

test('renders app without crashing', () => {
  render(<App />);
  
  expect(document.body).toBeInTheDocument();
});

test('simple test', () => {
  expect(true).toBe(true);
});