module.exports = {
  testEnvironment: 'jsdom',
  collectCoverage: true,
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      useESM: true,
      diagnostics: false,
      isolatedModules: true,
    },
  },
  moduleFileExtensions: ['tsx', 'ts', 'jsx', 'js', 'mjs'],
  testMatch: ['**/?(*.)+(spec|test).+(ts|tsx|js)'],
  setupFilesAfterEnv: ['./script/jest/jsdom-polyfill.js'],
};
