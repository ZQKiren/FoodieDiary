// src/setupTests.js
import '@testing-library/jest-dom';

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
  writable: true,
});

// Mock amcharts
jest.mock('@amcharts/amcharts5', () => ({
  Root: {
    new: jest.fn().mockReturnValue({
      setThemes: jest.fn(),
      container: { children: { push: jest.fn() } },
      dispose: jest.fn()
    })
  },
  percent: {},
  themes: { Animated: { new: jest.fn() } },
  color: jest.fn()
}), { virtual: true });

jest.mock('@amcharts/amcharts5/percent', () => ({}), { virtual: true });
jest.mock('@amcharts/amcharts5/xy', () => ({}), { virtual: true });
jest.mock('@amcharts/amcharts5/themes/Animated', () => ({ new: jest.fn() }), { virtual: true });