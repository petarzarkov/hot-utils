module.exports = {
  preset: "ts-jest",
  globals: {
    "ts-jest": {
      "tsconfig": "./tests/tsconfig.json"
    }
  },
  collectCoverage: false,
  coverageThreshold: {
    global: {
      "branches": 60,
      "functions": 65,
      "lines": 74,
      "statements": 74
    }
  },
  collectCoverageFrom: [
    "src/**/*.ts"
  ],
  coveragePathIgnorePatterns: [
    "src/constants.ts",
    "src/decorators",
    "src/utils/HotPromise.ts"
  ],
  rootDir: "../",
  testRegex: ".\/tests\/.*.test.ts$",
  transform: {
    ".(ts|tsx)": "ts-jest"
  },
  transformIgnorePatterns: ["^.+\\.js$"],
  moduleFileExtensions: [
    "ts",
    "tsx"
  ]
}