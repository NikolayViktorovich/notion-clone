import { render, screen } from '@testing-library/react';
import App from '../App';

test('notion', () => {
  render(<App />);
  const linkElement = screen.getByText(/Notion Clone/i);
  expect(linkElement).toBeInTheDocument();
});