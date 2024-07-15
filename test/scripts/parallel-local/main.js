const dotenv = require('dotenv');
const { fork } = require('child_process');
const path = require('path');
const fs = require('fs');

dotenv.config();

const startTime = new Date();
const testSuites = [
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
const remainingTests = [...testSuites];

const numWorkers = 3;
const basePort = 3307;
const workersCompleted = new Set();
const workersExited = new Set();

/**
 * Initializes and starts worker processes to handle tests in parallel.
 * @returns {void} Does not return a value.
 */
const initializeWorkers = () => {
    const workers = [];

    for (let i = 0; i < numWorkers; i++) {
        const port = basePort + i;
        const projectName = `worker-${i}`;
        const worker = fork(path.resolve(__dirname, 'test-runner.js'), [port.toString(), projectName], {
            stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
        });

        setupWorkerListeners(worker, port, projectName);
        assignTestToWorker(worker, projectName);
        workers.push(worker);
    }
};

/**
 * Sets up event listeners for a worker process.
 * @param {ChildProcess} worker - The worker process.
 * @param {number} port - The port number assigned to the worker.
 * @param {string} projectName - The project name assigned to the worker.
 * @returns {void} Does not return a value.
 */
const setupWorkerListeners = (worker, port, projectName) => {
    worker.stdout.on('data', (data) => console.log(`${projectName}: ${data.toString()}`));
    worker.stderr.on('data', (data) => console.error(`${projectName} Error: ${data.toString()}`));

    worker.on('message', (msg) => handleWorkerMessage(msg, worker, projectName));
    worker.on('exit', (code) => handleWorkerExit(code, projectName));
};

/**
 * Handles messages from worker processes, potentially assigning new tests.
 * @param {string} msg - The message from the worker.
 * @param {ChildProcess} worker - The worker process.
 * @param {string} projectName - The project name.
 * @returns {void} Does not return a value.
 */
const handleWorkerMessage = (msg, worker, projectName) => {
    if (msg === 'request_next_test') {
        assignTestToWorker(worker, projectName);
    }
};

/**
 * Assigns a test to a worker and logs the activity.
 * @param {ChildProcess} worker - The worker process.
 * @param {string} projectName - The project name.
 * @returns {void} Does not return a value.
 */
const assignTestToWorker = (worker, projectName) => {
    if (remainingTests.length > 0) {
        const test = remainingTests.pop();
        console.log(`${projectName} starting new suite: ${test} (${testSuites.length - remainingTests.length}/${testSuites.length})`);
        worker.send({ test, projectName });
    } else {
        console.log(`${projectName} found no more tests...`);
        worker.send('no_more_tests');
        workersCompleted.add(projectName);
    }
};

/**
 * Logs the exit of worker processes and checks for completion.
 * @param {number} code - The exit code of the worker process.
 * @param {string} projectName - The project name.
 * @returns {void} Does not return a value.
 */
const handleWorkerExit = (code, projectName) => {
    if (code !== 0) {
        console.error(`Worker ${projectName} exited with code ${code}`);
    } else {
        console.log(`Worker ${projectName} completed successfully`);
    }
    workersExited.add(projectName);
    if (workersCompleted.size === numWorkers && workersExited.size === numWorkers) {
        displayResults();
    }
};

/**
 * Displays the results of all tests by reading specific log files and aggregating results.
 * It first prints the contents of 'tests.log', calculates totals from 'results.log',
 * and finally reads 'fails.log' for any failures.
 * @returns {void} Does not return a value.
 */
const displayResults = () => {
    console.log('\nResults:\n');
    testSuites.forEach((testSuiteName) => {
        readLogFiles(testSuiteName, 'tests.log');
    });
    console.log('\n');

    let totalPassing = 0;
    let totalFailing = 0;
    let totalPending = 0;

    testSuites.forEach((testSuiteName) => {
        totalPassing += aggregateResults(testSuiteName, 'results.log', 'Passing');
        totalFailing += aggregateResults(testSuiteName, 'results.log', 'Failing');
        totalPending += aggregateResults(testSuiteName, 'results.log', 'Pending');
    });

    // Calculate elapsed time
    const endTime = new Date();
    const elapsed = new Date(endTime - startTime);
    const minutes = elapsed.getUTCMinutes();

    // Display total passing with elapsed time in minutes and seconds
    console.log('   ', totalPassing, 'Passing', `(${minutes}m)`);
    console.log('   ', totalFailing, 'Failing');
    if (totalPending > 0) {
        console.log('   ', totalPending, 'Pending');
    }

    console.log('\n');

    testSuites.forEach((testSuiteName) => {
        readLogFiles(testSuiteName, 'fails.log');
    });

    cleanupTestDirectories(testSuites);
};

/**
 * Reads and logs the contents of a specified log file from the directory of each test suite.
 * @param {string} testSuiteName - The name of the test suite directory.
 * @param {string} logFileName - The name of the log file to read.
 * @returns {void} Does not return a value.
 */
const readLogFiles = (testSuiteName, logFileName) => {
    const testDirectoryPath = path.join('./database/storage/', testSuiteName);
    try {
        const files = fs.readdirSync(testDirectoryPath);
        files.forEach((file) => {
            if (file === logFileName) {
                const filePath = path.join(testDirectoryPath, file);
                const data = fs.readFileSync(filePath, 'utf8');
                console.log(data);
            }
        });
    } catch (err) {
        console.error(`Error reading directory for ${testSuiteName}: ${err}`);
    }
};

/**
 * Aggregates results by counting amount of occurrences of passed, failing, and pending tests.
 * @param {string} testSuiteName - The name of the test suite.
 * @param {string} logFileName - The log file from which to read and count results.
 * @param {string} searchKeyword - The keyword to search for in the log entries (e.g., "Passing").
 * @returns {number} The total count of occurrences of the search keyword.
 */
const aggregateResults = (testSuiteName, logFileName, searchKeyword) => {
    const testDirectoryPath = path.join('./database/storage/', testSuiteName);
    try {
        const files = fs.readdirSync(testDirectoryPath);
        const file = files.find((file) => file === logFileName);
        if (file) {
            const filePath = path.join(testDirectoryPath, file);
            const data = fs.readFileSync(filePath, 'utf8');
            return data.split('\n')
                .map((line) => line.trim()) // Remove any leading or trailing whitespace
                .filter((line) => line.endsWith(searchKeyword)) // Ensure the line ends with the keyword
                .reduce((acc, line) => {
                    const parts = line.split(' '); // Split the line into parts
                    const count = parseInt(parts[0], 10); // The number is the first part of the line
                    return acc + (isNaN(count) ? 0 : count); // Add it to the accumulator ensuring it's a number
                }, 0);
        }
    } catch (err) {
        console.error(`Error reading directory for ${testSuiteName}: ${err}`);
    }
    return 0;
};

/**
 * Cleans up directories for each test suite after tests have completed.
 * This function iterates through each test suite and removes its corresponding directory,
 * ensuring the testing environment is clean for subsequent runs.
 *
 * @param {Array<string>} testSuites - Array of test suite names whose directories are to be cleaned up.
 * @returns {void} Does not return a value.
 */
const cleanupTestDirectories = (testSuites) => {
    testSuites.forEach((testSuiteName) => {
        const testDirectoryPath = path.join('./database/storage/', testSuiteName);
        try {
            fs.rmSync(testDirectoryPath, { recursive: true });
        } catch (err) {
            console.error(`Error removing directory ${testDirectoryPath}: ${err}`);
        }
    });
};

initializeWorkers();
