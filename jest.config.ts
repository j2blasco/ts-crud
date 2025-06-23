import type { JestConfigWithTsJest } from 'ts-jest'

const config: JestConfigWithTsJest = {
  extensionsToTreatAsEsm: ['.ts'],
  verbose: true,
  preset: 'ts-jest/presets/default-esm',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { useESM: true }]
  },
  testMatch: [
    '**/*.spec.ts',
    '**/*.test.ts',
    '!**/*.utils.test.ts'
  ],
  testPathIgnorePatterns: ['./dist']
}

export default config