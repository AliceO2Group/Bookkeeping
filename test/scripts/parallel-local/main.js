const dotenv = require('dotenv');
const { fork, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { BASE_STORAGE_PATH, MessageKey } = require('./test-runner');
const { LogManager } = require('@aliceo2/web-ui');

dotenv.config();

const fsPromises = fs.promises;
const startTime = new Date();
const testSuites = [
    'unit',
    'api',
    'lhc-periods',
    'lhc-fills',
    'logs',
    'envs',
    'runs',
    'tags',
    'flps',
    'home',
    'about',
    'eos-report',
    'data-passes',
    'simulation-passes',
    'qc-flag-types',
    'qc-flags',
];
const remainingTests = [...testSuites];

const amountOfWorkers = parseInt(process.env?.WORKERS, 10) || 3;
const workersExited = new Set();

const imageTag = 'test-parallel-application:latest';

const logger = LogManager.getLogger('MAIN');

/**
 * Builds the Docker image used by all the workers.
 *
 * @returns {void}
 */
const buildDockerImage = () => {
    const command = 'docker compose -f docker-compose.test-parallel-base.yml -f docker-compose.test-parallel-local.yml build';
    execSync(`${command} && docker tag test-parallel-application ${imageTag}`, { stdio: 'inherit' });
};

/**
 * Initializes and starts worker processes to handle tests in parallel.
 * @returns {void}
 */
const initializeWorkers = () => {
    cleanupTestDirectories(testSuites);

    const workers = [];

    for (let i = 0; i < amountOfWorkers; i++) {
        const workerName = `worker-${i}`;
        const worker = fork(
            path.resolve(__dirname, 'test-runner.js'),
            [workerName],
            { stdio: ['pipe', 'pipe', 'pipe', 'ipc'] },
        );

        setupWorkerListeners(worker, workerName);
        assignTestToWorker(worker, workerName);
        workers.push(worker);
    }
};

/**
 * Sets up event listeners for a worker process.
 * @param {ChildProcess} worker - The worker process.
 * @param {string} workerName - The worker name assigned to the worker.
 * @returns {void}
 */
const setupWorkerListeners = (worker, workerName) => {
    const workerLogger = LogManager.getLogger(`WORKER ${workerName}`);

    worker.stdout.on('data', (data) => workerLogger.infoMessage(`${workerName}: ${data.toString()}`));
    // eslint-disable-next-line no-console
    worker.stderr.on('data', (data) => workerLogger.infoMessage(`${workerName} Error: ${data.toString()}`));

    worker.on('message', (msg) => handleWorkerMessage(msg, worker, workerName));
    worker.on('exit', (code) => handleWorkerExit(code, workerName));
};

/**
 * Handles messages from worker processes, potentially assigning new tests.
 * @param {string} msg - The message from the worker.
 * @param {ChildProcess} worker - The worker process.
 * @param {string} workerName - The worker name.
 * @returns {void}
 */
const handleWorkerMessage = (msg, worker, workerName) => {
    if (msg === MessageKey.RequestNextTest) {
        assignTestToWorker(worker, workerName);
    }
};

/**
 * Assigns a test to a worker and logs the activity.
 * @param {ChildProcess} worker - The worker process.
 * @param {string} workerName - The worker name.
 * @returns {void}
 */
const assignTestToWorker = (worker, workerName) => {
    const workerLogger = LogManager.getLogger(`WORKER ${workerName}`);

    if (remainingTests.length > 0) {
        const test = remainingTests.pop();
        workerLogger.infoMessage(`starting new suite: ${test} (${testSuites.length - remainingTests.length}/${testSuites.length})`);
        worker.send({ test, workerName });
    } else {
        workerLogger.infoMessage('found no more tests...');
        worker.send(MessageKey.NoMoreTests);
    }
};

/**
 * Logs the exit of worker processes and checks for completion.
 * @param {number} code - The exit code of the worker process.
 * @param {string} workerName - The worker name.
 * @returns {void}
 */
const handleWorkerExit = (code, workerName) => {
    const workerLogger = LogManager.getLogger(`WORKER ${workerName}`);

    if (code !== 0) {
        workerLogger.errorMessage(`exited with code ${code}`);
    } else {
        workerLogger.infoMessage('completed successfully');
    }
    workersExited.add(workerName);
    handleAllWorkersExited();
};

/**
 * Handles actions to be taken once all workers have exited.
 * This function checks if all worker processes have exited. If so, it proceeds to display the results
 * of the testing process. This function shows results only once all workers have stopped running, regardless of
 * whether they completed all assigned tests in case of a crash.
 * @returns {void}
 */
const handleAllWorkersExited = () => {
    if (workersExited.size === amountOfWorkers) {
        displayResults();
    }
};

/**
 * Displays the results of all tests by reading specific log files and aggregating results.
 * It first prints the contents of 'tests.log', calculates totals from 'results.log',
 * and finally reads 'fails.log' for any failures.
 * @returns {void}
 */
const displayResults = async () => {
    logger.infoMessage('\n');
    logger.infoMessage('Results:');
    logger.infoMessage('\n');
    await readAllLogFiles('tests.log');

    // eslint-disable-next-line no-console
    logger.infoMessage('\n');

    let totalPassing = 0;
    let totalFailing = 0;
    let totalPending = 0;

    for (const testSuiteName of testSuites) {
        totalPassing += aggregateResults(testSuiteName, 'results.log', 'Passing');
        totalFailing += aggregateResults(testSuiteName, 'results.log', 'Failing');
        totalPending += aggregateResults(testSuiteName, 'results.log', 'Pending');
    }

    // Calculate elapsed time
    const endTime = new Date();
    const elapsed = new Date(endTime - startTime);
    const minutes = elapsed.getUTCMinutes();

    // Display total passing with elapsed time in minutes and seconds
    // eslint-disable-next-line no-console
    logger.infoMessage(`   ${totalPassing} Passing(${minutes}m)`);
    // eslint-disable-next-line no-console
    logger.infoMessage(`   ${totalFailing} Failing`);
    if (totalPending > 0) {
        // eslint-disable-next-line no-console
        logger.infoMessage(`   ${totalPending} Pending`);
    }
    // eslint-disable-next-line no-console
    logger.infoMessage('\n');

    await readAllLogFiles('fails.log');
};

/**
 * Asynchronously reads and logs the contents of a specified log file from the directory of each test suite.
 * This function finds the log file in the test suite's directory, reads it if present, and logs the content.
 * If the file is not found or an error occurs during reading, an error is logged.
 *
 * @param {string} testSuiteName - The name of the test suite directory.
 * @param {string} logFileName - The name of the log file to read.
 * @returns {Promise<void>} A Promise that resolves when the file has been read and logged, or an error has occurred.
 */
const dumpLogFileContentToConsole = async (testSuiteName, logFileName) => {
    const filePath = path.join(BASE_STORAGE_PATH, testSuiteName, logFileName);
    try {
        const data = await fsPromises.readFile(filePath, 'utf8');
        logger.infoMessage(data.toString());
    } catch (err) {
        // Don't log error when no directories are found, because directories are managed by the custom mocha reporter.
        if (!err.message.includes('ENOENT')) {
            // eslint-disable-next-line no-console
            logger.errorMessage(`Error reading log file at ${filePath}: ${err}`);
        }
    }
};

/**
 * Initiates the concurrent reading of a specified log file for all test suites. Uses dumpLogFileContentToConsole to perform
 * concurrent asynchronous read operations on each test suite's specified log file. Uses Promise.all to manage the concurrency,
 * ensuring all read operations are initiated at the same time and handling their failure.
 *
 * @param {string} logFileName - The name of the log file to read for each test suite (e.g., 'tests.log' or 'fails.log').
 * @returns {Promise<void>} A Promise that resolves when all log files have been read and logged, or rejects if any read operation fails.
 */
const readAllLogFiles = async (logFileName) => {
    const readOperations = testSuites.map((testSuiteName) => dumpLogFileContentToConsole(testSuiteName, logFileName));
    await Promise.all(readOperations)
        .catch((err) => {
            // eslint-disable-next-line no-console
            logger.errorMessage('An error occurred while reading log files:', err);
        });
};

/**
 * Aggregates results by counting amount of occurrences of passed, failing, and pending tests.
 * @param {string} testSuiteName - The name of the test suite.
 * @param {string} logFileName - The log file from which to read and count results.
 * @param {string} searchKeyword - The keyword to search for in the log entries (e.g., "Passing").
 * @returns {number} The total count of occurrences of the search keyword.
 */
const aggregateResults = (testSuiteName, logFileName, searchKeyword) => {
    const testDirectoryPath = path.join(BASE_STORAGE_PATH, testSuiteName);
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
        // eslint-disable-next-line no-console
        logger.errorMessage(`Error reading directory for ${testSuiteName}: ${err}`);
    }
    return 0;
};

/**
 * Cleans up directories for each test suite before tests are run.
 * This function iterates through each test suite and removes its corresponding directory,
 * ensuring the testing environment is clean for the run.
 *
 * @param {Array<string>} testSuites - Array of test suite names whose directories are to be cleaned up.
 * @returns {void}
 */
const cleanupTestDirectories = (testSuites) => {
    testSuites.forEach((testSuiteName) => {
        const testDirectoryPath = path.join(BASE_STORAGE_PATH, testSuiteName);
        try {
            fs.rmSync(testDirectoryPath, { recursive: true });
        } catch (err) {
            // Don't log error when no directories are found, because directories are managed by the custom mocha reporter.
            if (!err.message.includes('ENOENT')) {
                // eslint-disable-next-line no-console
                logger.errorMessage(`Error removing directory ${testDirectoryPath}: ${err}`);
            }
        }
    });
};

buildDockerImage();
initializeWorkers();
