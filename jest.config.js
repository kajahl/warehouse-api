const unitTestsConfig = {
    displayName: 'unit',
    testRegex: ".*\\.spec\\.unit\\.ts$",
    moduleFileExtensions: [
        "js",
        "json",
        "ts"
    ],
    rootDir: "src",
    transform: {
        "^.+\\.(t|j)s$": "ts-jest"
    },
    collectCoverageFrom: [
        "**/*.(t|j)s"
    ],
    coverageDirectory: "../coverage/unit",
    testEnvironment: "node",
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/$1'
    },
    detectOpenHandles: true,
}

const integrationTestsConfig = {
    displayName: 'integration',
    testRegex: ".*\\.spec\\.int\\.ts$",
    moduleFileExtensions: [
        "js",
        "json",
        "ts"
    ],
    rootDir: "src",
    transform: {
        "^.+\\.(t|j)s$": "ts-jest"
    },
    collectCoverageFrom: [
        "**/*.(t|j)s"
    ],
    coverageDirectory: "../coverage/integration",
    testEnvironment: "node",
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/$1'
    },
    detectOpenHandles: true,
}


module.exports = {
    projects: [unitTestsConfig, integrationTestsConfig]
};