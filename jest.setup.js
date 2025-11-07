// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock LocalForage
jest.mock('localforage', () => {
  const mockStore = {};
  
  return {
    __esModule: true,
    default: {
      config: jest.fn(),
      getItem: jest.fn((key) => Promise.resolve(mockStore[key] || null)),
      setItem: jest.fn((key, value) => {
        mockStore[key] = value;
        return Promise.resolve(value);
      }),
      removeItem: jest.fn((key) => {
        delete mockStore[key];
        return Promise.resolve();
      }),
      clear: jest.fn(() => {
        Object.keys(mockStore).forEach(key => delete mockStore[key]);
        return Promise.resolve();
      }),
    },
  };
});

// Mock window methods
global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = jest.fn();
global.Blob = jest.fn((parts, options) => ({
  parts,
  options,
  size: 0,
  type: options?.type || '',
}));

// Mock FileReader
global.FileReader = class FileReader {
  constructor() {
    this.result = null;
    this.onload = null;
    this.onerror = null;
  }
  
  readAsText(file) {
    setTimeout(() => {
      this.result = '{"goals":[],"leadPipeline":[]}';
      if (this.onload) {
        this.onload({ target: this });
      }
    }, 0);
  }
};

// Suppress console errors in tests (optional)
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
