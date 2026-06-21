import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import './styles/global.css';

const originalWarn = console.warn.bind(console);
console.warn = (...args) => {
  if (
    args.some(
      (arg) =>
        typeof arg === 'string' &&
        arg.includes('Clock: This module has been deprecated'),
    )
  ) {
    return;
  }

  originalWarn(...args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
