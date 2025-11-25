module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: [
    '<rootDir>/__tests__'
  ],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
    '**/?(*.)+(spec|test).ts?(x)'
  ],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json'
      }
    ]
  },
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx',
    'json',
    'node'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/hooks/(.*)$': '<rootDir>/src/hooks/$1',
    '^@/assets/(.*)$': '<rootDir>/src/assets/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**',
    '!src/pages/api/_middleware.ts',
    '!src/pages/_app.tsx',
    '!src/pages/_document.tsx'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: [
    'json',
    'text',
    'lcov',
    'clover'
  ],
  testTimeout: 30000,
  verbose: true,
  // Transform to handle Next.js API routes
  transformIgnorePatterns: [
    '/node_modules/(?!(@phosphor-icons/react)/)'
  ],
  globals: {
    'ts-jest': {
      isolatedModules: true
    }
  }
};