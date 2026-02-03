import { render } from '@testing-library/react';
import App from './App';

jest.mock('./store/useStore', () => ({
  useStore: () => ({
    currentPage: null,
    workspaces: [],
    sidebarOpen: true,
    setSidebarOpen: jest.fn(),
    initializeOffline: jest.fn().mockResolvedValue(undefined),
    createPage: jest.fn(),
    updatePage: jest.fn(),
    deletePage: jest.fn(),
    createBlock: jest.fn(),
    updateBlock: jest.fn(),
    deleteBlock: jest.fn(),
    moveBlock: jest.fn(),
    searchContent: jest.fn().mockReturnValue([]),
    getBlockComments: jest.fn().mockReturnValue([]),
    addComment: jest.fn(),
    resolveComment: jest.fn(),
    deleteComment: jest.fn(),
    createPageFromTemplate: jest.fn(),
    offlineStatus: { isOnline: true, lastSync: null },
    forceSync: jest.fn(),
    templates: [],
  }),
}));

jest.mock('./hooks/useTheme', () => ({
  useTheme: () => ({
    currentTheme: 'light',
    themes: [{ id: 'light', name: 'Light', colors: { background: '#fff', text: '#000', border: '#ccc' } }],
    setTheme: jest.fn(),
  }),
  applyThemeToDocument: jest.fn(),
}));

test('renders app without crashing', () => {
  render(<App />);
  expect(document.body).toBeInTheDocument();
});

test('simple test', () => {
  expect(true).toBe(true);
});
