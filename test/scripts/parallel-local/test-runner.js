const { exec } = require('child_process');

// Flag to check if it's the first test, which requires building the Docker image.
let isFirstTest = true;

/**
 * Listens for messages from the main process and handles them.
 * Ensures the worker continues even after a test fails.
 * @returns {void} Does not return a value.
 */
process.on('message', (msg) => {
    if (msg === 'no_more_tests') {
        // Exit the process when no more tests are available.
        process.exit();
    } else {
        // Run the test with the given settings.
        runTest(msg)
            .then(() => {
                // Request the next test upon successful completion.
                process.send('request_next_test');
            })
            .catch((error) => {
                // Log the error and request the next test even after failure.
                console.error('Test execution error:', error);
                process.send('request_next_test');
            });
    }
});

/**
 * Executes a test group using Docker Compose. Builds only on the first test execution.
 * @param {Object} msg - The test configuration message containing test type, port, and project name.
 * @returns {Promise<void>} A promise that resolves on successful test completion, or rejects on failure.
 */
const runTest = ({ test, port, projectName }) => new Promise((resolve, reject) => {
    // Include the `--build` flag only for the first test.
    const buildFlag = isFirstTest ? '--build' : '';

    // Docker Compose command with conditional build option.
    // eslint-disable-next-line max-len
    const command = `COMPOSE_PROJECT_NAME=${projectName} docker-compose -f docker-compose.test-parallel-local.yml up ${buildFlag} --abort-on-container-exit`;

    exec(command, {
        env: {
            ...process.env,
            TEST_TYPE: test,
            DB_PORT: port,
        },
    }, (error, stdout, stderr) => {
        if (error) {
            console.error(`stderr: ${stderr}`);
            reject(error.message);
            return;
        }
        console.log(`stdout: ${stdout}`);
        // After the first run, set the flag to false to skip rebuilding.
        if (isFirstTest) {
            isFirstTest = false;
        }
        resolve();
    });
});
