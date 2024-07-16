const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { BASE_STORAGE_PATH, NO_MORE_TESTS, REQUEST_NEXT_TEST } = require('./sharedConstants');

let isFirstTest = true;

/**
 * Ensures the directory exists before executing tests.
 * @param {string} testType The type of the test.
 * @returns {void}
 */
const createTestDirectoryIfNotExist = (testType) => {
    const dirPath = path.join(BASE_STORAGE_PATH, testType);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

/**
 * Handles incoming messages to determine test execution workflow.
 * @param {string|Object} message - Message received from the main process.
 * @returns {void}
 */
const processMessage = (message) => {
    if (message === NO_MORE_TESTS) {
        process.exit();
    } else {
        manageTestExecution(message);
    }
};

process.on('message', processMessage);

/**
 * Executes a set of tests based on received settings.
 * @param {Object} testConfiguration - Configuration for the test.
 * @returns {void}
 */
const manageTestExecution = (testConfiguration) => {
    createTestDirectoryIfNotExist(testConfiguration.test);
    executeTest(testConfiguration)
        .then(() => process.send(REQUEST_NEXT_TEST))
        .catch((error) => {
            // eslint-disable-next-line no-console
            console.error('Test execution error:', error);
            process.send(REQUEST_NEXT_TEST);
        });
};

/**
 * Executes a specified test using Docker Compose.
 * @param {Object} testConfiguration - Test details including type and worker name.
 * @returns {Promise<void>} Resolves on successful test execution.
 */
const executeTest = ({ test, workerName }) => {
    const dockerCommand = buildDockerCommand(workerName);
    return new Promise((resolve) => {
        executeDockerCommand(dockerCommand, test, workerName, resolve);
    });
};

/**
 * Constructs the Docker Compose command based on test parameters.
 * @param {string} workerName - Name of the worker under test.
 * @returns {string} Docker command string.
 */
const buildDockerCommand = (workerName) => {
    const buildOption = isFirstTest ? '--build' : '';
    // eslint-disable-next-line max-len
    return `COMPOSE_PROJECT_NAME=${workerName} docker-compose -f docker-compose.test-parallel-base.yml -f docker-compose.test-parallel-local.yml up ${buildOption} --abort-on-container-exit`;
};

/**
 * Executes the Docker command and manages the process's output and lifecycle.
 * @param {string} command - Docker command to be executed.
 * @param {string} testType - Type of test being executed.
 * @param {string} workerName - Name of the worker.
 * @param {Function} resolve - Function to resolve the promise once execution completes.
 * @returns {void}
 */
const executeDockerCommand = (command, testType, workerName, resolve) => {
    const environment = {
        ...process.env,
        TEST_TYPE: testType,
    };

    exec(command, { env: environment }, () => {
        isFirstTest = false;
        resolve();
    });
};
