const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

let isFirstTest = true;

/**
 * Ensures the directory exists before executing tests.
 * @param {string} testType The type of the test.
 * @returns {void} Does not return a value.
 */
const ensureDirectoryExists = (testType) => {
    const dirPath = path.join('./database/storage', testType);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

/**
 * Handles incoming messages to determine test execution workflow.
 * @param {string|Object} message - Message received from the main process.
 * @returns {void} Does not return a value.
 */
const processMessage = (message) => {
    if (message === 'no_more_tests') {
        process.exit();
    } else {
        manageTestExecution(message);
    }
};

process.on('message', processMessage);

/**
 * Orchestrates the execution of a test based on received settings.
 * @param {Object} testConfig - Configuration for the test.
 * @returns {void} Does not return a value.
 */
const manageTestExecution = (testConfig) => {
    ensureDirectoryExists(testConfig.test);
    executeTest(testConfig)
        .then(() => process.send('request_next_test'))
        .catch((error) => {
            console.error('Test execution error:', error);
            process.send('request_next_test');
        });
};

/**
 * Executes a specified test using Docker Compose.
 * @param {Object} testConfig - Test details including type, port, and project name.
 * @returns {Promise<void>} Resolves on successful test execution.
 */
const executeTest = ({ test, port, projectName }) => {
    const dockerCommand = buildDockerCommand(test, projectName);
    return new Promise((resolve) => {
        executeDockerCommand(dockerCommand, test, port, projectName, resolve);
    });
};

/**
 * Constructs the Docker Compose command based on test parameters.
 * @param {string} testType - Type of the test to run.
 * @param {string} projectName - Name of the project under test.
 * @returns {string} Docker command string.
 */
const buildDockerCommand = (testType, projectName) => {
    const buildOption = isFirstTest ? '--build' : '';
    // eslint-disable-next-line max-len
    return `COMPOSE_PROJECT_NAME=${projectName} docker-compose -f docker-compose.test-parallel-local.yml up ${buildOption} --abort-on-container-exit`;
};

/**
 * Executes the Docker command and manages the process's output and lifecycle.
 * @param {string} command - Docker command to be executed.
 * @param {string} testType - Type of test being executed.
 * @param {string} port - Port number for database connectivity.
 * @param {string} projectName - Name of the project.
 * @param {Function} resolve - Function to resolve the promise once execution completes.
 * @returns {void} Does not return a value.
 */
const executeDockerCommand = (command, testType, port, projectName, resolve) => {
    const environment = {
        ...process.env,
        TEST_TYPE: testType,
        DB_PORT: port,
    };

    exec(command, { env: environment }, () => {
        updateIsFirstTest();
        resolve();
    });
};

/**
 * Updates the state to reflect that the first test has been executed.
 * @returns {void} Does not return a value.
 */
const updateIsFirstTest = () => {
    isFirstTest = false;
};
