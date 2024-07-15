const { exec } = require('child_process');

let isFirstTest = true;

/**
 * Handles messages from the main process and manages test execution flow.
 * @returns {void} Does not return a value.
 */
process.on('message', handleMessage);

/**
 * Processes a received message and executes or terminates tests accordingly.
 * @param {string|Object} msg - Message from the main process.
 * @returns {void} Does not return a value.
 */
function handleMessage(msg) {
    if (msg === 'no_more_tests') {
        process.exit();
    } else {
        executeTestWorkflow(msg);
    }
}

/**
 * Manages the execution of a test and the follow-up actions based on the result.
 * @param {Object} msg - The test settings to be applied.
 * @returns {void} Does not return a value.
 */
function executeTestWorkflow(msg) {
    runTest(msg)
        .then(() => process.send('request_next_test'))
        .catch((error) => {
            console.error('Test execution error:', error);
            process.send('request_next_test');
        });
}

/**
 * Executes a test using Docker Compose, handling test-specific settings and output.
 * @param {Object} msg - Configuration for the test including test type, port, and project name.
 * @returns {Promise<void>} Resolves when the test completes successfully, rejects on error.
 */
function runTest({ test, port, projectName }) {
    const command = buildDockerCommand(test, projectName);
    return new Promise((resolve, reject) => {
        execCommand(command, test, port, projectName, resolve, reject);
    });
}

/**
 * Constructs the Docker Compose command to run.
 * @param {string} test - The type of test to run.
 * @param {string} projectName - The name of the project under test.
 * @returns {string} The constructed Docker command.
 */
function buildDockerCommand(test, projectName) {
    const buildFlag = isFirstTest ? '--build' : '';
    // eslint-disable-next-line max-len
    return `COMPOSE_PROJECT_NAME=${projectName} docker-compose -f docker-compose.test-parallel-local.yml up ${buildFlag} --abort-on-container-exit`;
}

/**
 * Executes the Docker command and handles the process's output.
 * @param {string} command - The Docker command to execute.
 * @param {string} test - The test type.
 * @param {string} port - The database port.
 * @param {string} projectName - The project name.
 * @param {Function} resolve - The resolve function for the promise.
 * @returns {void} Does not return a value.
 */
function execCommand(command, test, port, projectName, resolve) {
    const env = {
        ...process.env,
        TEST_TYPE: test,
        DB_PORT: port,
    };

    exec(command, { env }, () => {
        updateFirstTestFlag();
        resolve();
    });
}

/**
 * Updates the flag indicating whether the current test is the first test.
 * @returns {void} Does not return a value.
 */
function updateFirstTestFlag() {
    if (isFirstTest) {
        isFirstTest = false;
    }
}
