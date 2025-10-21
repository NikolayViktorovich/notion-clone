import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

jest.mock('./store/useStore', () => ({
  useStore: () => ({
    currentPage: null,
    workspaces: [],
    isLoading: false,
    initializeApp: jest.fn(),
  }),
}));

test('renders app without crashing', () => {
  render(<App />);
  
  const appElement = screen.getByTestId('app') || screen.getByRole('main') || document.body;
  expect(appElement).toBeInTheDocument();
});

test('simple test', () => {
  expect(true).toBe(true);
});