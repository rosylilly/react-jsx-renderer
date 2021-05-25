module.exports = {
  testEnvironment: 'node',
  collectCoverage: true,
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  moduleFileExtensions: ['tsx', 'ts', 'jsx', 'js', 'mjs'],
  testMatch: ['**/?(*.)+(spec|test).+(ts|tsx|js)'],
};
