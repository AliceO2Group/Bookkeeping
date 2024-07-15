const { exec } = require('child_process');
const fs = require('fs');

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
 * @param {Function} reject - The reject function for the promise.
 * @returns {void} Does not return a value.
 */
function execCommand(command, test, port, projectName, resolve, reject) {
    const env = {
        ...process.env,
        TEST_TYPE: test,
        DB_PORT: port,
    };
    const jsonOutputPath = `./database/storage/${test}.json`;

    exec(command, { env }, (error, stdout, stderr) => {
        if (error) {
            console.error(`stderr: ${stderr}`);
            reject(new Error(error.message));
            return;
        }
        processTestResult(jsonOutputPath, projectName, resolve, reject);
    });
}

/**
 * Processes the test result by reading the output JSON file.
 * @param {string} jsonOutputPath - Path to the test result JSON file.
 * @param {string} projectName - The project name.
 * @param {Function} resolve - The resolve function for the promise.
 * @param {Function} reject - The reject function for the promise.
 * @returns {void} Does not return a value.
 */
function processTestResult(jsonOutputPath, projectName, resolve, reject) {
    fs.readFile(jsonOutputPath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading JSON output from file: ${err}`);
            reject(err);
            return;
        }
        process.send({ type: 'result', projectName, data });
        cleanUp(jsonOutputPath);
        updateFirstTestFlag();
        resolve();
    });
}

/**
 * Deletes the JSON output file after processing.
 * @param {string} jsonOutputPath - Path to the file to be deleted.
 * @returns {void} Does not return a value.
 */
function cleanUp(jsonOutputPath) {
    fs.unlink(jsonOutputPath, (err) => {
        if (err) {
            console.error(`Error deleting JSON output file: ${err}`);
        }
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
