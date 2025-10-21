import '@testing-library/jest-dom';

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