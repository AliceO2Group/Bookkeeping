const dotenv = require('dotenv');
const { fork } = require('child_process');
const path = require('path');

dotenv.config();

const tests = [
    'unit',
    'api',
    'lhcPeriods',
    'lhcFills',
    'logs',
    'envs',
    'runs',
    'subsystems',
    'tags',
    'flps',
    'home',
    'about',
    'eosReport',
    'dataPasses',
    'simulationPasses',
    'qcFlagTypes',
    'qcFlags',
];
const initialTestAmount = tests.length;

const numWorkers = 3;
const basePort = 3307;
const results = [];
const workersCompleted = new Set();

/**
 * Start worker processes to handle tests in parallel.
 * @returns {void} Does not return a value.
 */
const startWorker = () => {
    const workers = [];
    for (let i = 0; i < numWorkers; i++) {
        const port = basePort + i;
        const projectName = `worker-${i}`;
        const worker = fork(path.resolve(__dirname, 'test-runner.js'), [port.toString(), projectName], {
            stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
        });

        worker.stdout.on('data', (data) => console.log(`${projectName}: ${data.toString()}`));
        worker.stderr.on('data', (data) => console.error(`${projectName} Error: ${data.toString()}`));

        worker.on('message', (msg) => handleWorkerMessage(msg, worker, port, projectName));
        worker.on('exit', (code) => logWorkerExit(code, projectName));

        assignTestToWorker(worker, port, projectName);
        workers.push(worker);
    }
};

/**
 * Handles messages from worker processes, including handling results and assigning new tests.
 * @param {Object} msg - The message from the worker.
 * @param {ChildProcess} worker - The child process that sent the message.
 * @param {number} port - The port number assigned to the worker.
 * @param {string} projectName - The project name assigned to the worker.
 * @returns {void} Does not return a value.
 */
const handleWorkerMessage = (msg, worker, port, projectName) => {
    if (msg.type === 'result') {
        results.push(msg.data); // Collect results from each worker
        workersCompleted.add(projectName); // Mark worker as completed for result submission
        checkAllWorkersCompleted();
    } else if (msg === 'request_next_test') {
        if (tests.length > 0) {
            const test = tests.pop();
            console.log(`${projectName} starting new suite: ${test} (${initialTestAmount - tests.length}/${initialTestAmount})`);
            worker.send({ test, port, projectName });
        } else {
            console.log(`${projectName} found no more tests...`);
            worker.send('no_more_tests');
        }
    }
};

/**
 * Checks if all workers have completed their tasks and then processes the results.
 * @returns {void} Does not return a value.
 */
const checkAllWorkersCompleted = () => {
    if (workersCompleted.size === numWorkers) {
        displayResults(results); // Process and display results when all workers are done
    }
};

/**
 * Logs the exit of worker processes.
 * @param {number} code - The exit code of the worker process.
 * @param {string} projectName - The project name of the worker.
 * @returns {void} Does not return a value.
 */
const logWorkerExit = (code, projectName) => {
    if (code !== 0) {
        console.error(`Worker ${projectName} exited with code ${code}`);
    } else {
        console.log(`Worker ${projectName} completed successfully`);
    }
    workersCompleted.add(projectName); // Mark worker as completed for exit
    checkAllWorkersCompleted();
};

/**
 * Assigns a test to a worker.
 * @param {ChildProcess} worker - The child process to send the test to.
 * @param {number} port - The port number to use for the test.
 * @param {string} projectName - The project name for the test environment.
 * @returns {void} Does not return a value.
 */
const assignTestToWorker = (worker, port, projectName) => {
    if (tests.length > 0) {
        const test = tests.pop();
        console.log(`Starting ${test} tests on port ${port} by ${projectName} (${initialTestAmount - tests.length}/${initialTestAmount})`);
        worker.send({ test, port, projectName });
    }
};

/**
 * Displays the test results in a formatted manner.
 * Parses JSON strings, extracts test details, and prints them out with stats summary.
 * @param {Array<string>} resultsArray - An array of strings containing test results with embedded JSON.
 * @returns {void} Does not return a value.
 */
const displayResults = (resultsArray) => {
    console.log('\nFinal Test Results:');

    let totalSuites = 0;
    let totalTests = 0;
    let totalPasses = 0;
    let totalFailures = 0;
    let totalPending = 0;

    resultsArray.forEach((resultString) => {
        // Find the starting index of the JSON object
        const startIndex = resultString.indexOf('{');
        if (startIndex === -1) {
            console.error('No JSON found in result');
            return;
        }

        // Extract only the JSON part
        const jsonString = resultString.substring(startIndex);

        try {
            const result = JSON.parse(jsonString);

            if (result.stats) {
                console.log(`\nResults from ${result.stats.suites} suite(s):`);
                console.log(`Tests Run: ${result.stats.tests}`);
                console.log(`Passes: ${result.stats.passes}`);
                console.log(`Failures: ${result.stats.failures}`);
                console.log(`Pending: ${result.stats.pending}`);

                totalSuites += 1;
                totalTests += result.stats.tests;
                totalPasses += result.stats.passes;
                totalFailures += result.stats.failures;
                totalPending += result.stats.pending;

                result.failures.forEach((fail) => {
                    console.log(`\nFailed Test: ${fail.fullTitle}`);
                    console.log(`Error: ${fail.err.message}`);
                    console.log(`Stack: ${fail.err.stack}`);
                });
            }
        } catch (error) {
            console.error('Error parsing JSON result:', error);
        }
    });

    console.log('\nSummary of all test suites:');
    console.log(`Total Suites Processed: ${totalSuites}`);
    console.log(`Total Tests Run: ${totalTests}`);
    console.log(`Total Passes: ${totalPasses}`);
    console.log(`Total Failures: ${totalFailures}`);
    console.log(`Total Pending: ${totalPending}`);
};

startWorker();
