import { render } from '@testing-library/react';
import App from '../App';

jest.mock('../store/useStore', () => ({
  useStore: () => ({
    currentPage: null,
    workspaces: [],
    sidebarOpen: false,
    setSidebarOpen: jest.fn(),
    initializeOffline: jest.fn(),
    createPage: jest.fn(),
    searchContent: jest.fn().mockReturnValue([]),
    getBlockComments: jest.fn().mockReturnValue([]),
    offlineStatus: { isOnline: true, lastSync: null },
    forceSync: jest.fn(),
    templates: [],
  }),
}));

jest.mock('../hooks/useTheme', () => ({
  useTheme: () => ({
    currentTheme: 'light',
    themes: [{ id: 'light', name: 'Light', colors: { background: '#fff', text: '#000', border: '#ccc' } }],
    setTheme: jest.fn(),
  }),
  applyThemeToDocument: jest.fn(),
}));

jest.mock('../hooks/useWebClipper', () => ({
  useWebClipper: () => ({
    isClipperOpen: false,
    currentClip: null,
    isLoading: false,
    openClipper: jest.fn(),
    closeClipper: jest.fn(),
    saveClip: jest.fn(),
    importFromUrl: jest.fn(),
  }),
}));

test('app renders', () => {
  render(<App />);
  expect(document.body).toBeInTheDocument();
});
