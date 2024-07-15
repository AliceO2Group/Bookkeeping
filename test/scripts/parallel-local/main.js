const dotenv = require('dotenv');
const { fork } = require('child_process');
const path = require('path');
const fs = require('fs');

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
const initialTests = tests.slice();

const numWorkers = 3;
const basePort = 3307;
const workersCompleted = new Set();
const workersExited = new Set();

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
 * Handles messages from worker processes, including assigning new tests.
 * @param {string} msg - The message from the worker.
 * @param {ChildProcess} worker - The child process that sent the message.
 * @param {number} port - The port number assigned to the worker.
 * @param {string} projectName - The project name assigned to the worker.
 * @returns {void} Does not return a value.
 */
const handleWorkerMessage = (msg, worker, port, projectName) => {
    if (msg === 'request_next_test') {
        if (tests.length > 0) {
            const test = tests.pop();
            console.log(`${projectName} starting new suite: ${test} (${initialTests.length - tests.length}/${initialTests.length})`);
            worker.send({ test, port, projectName });
        } else {
            console.log(`${projectName} found no more tests...`);
            worker.send('no_more_tests');
            workersCompleted.add(projectName);
        }
    }
};

/**
 * Checks if all workers have completed their tasks and then processes the results.
 * @returns {void} Does not return a value.
 */
const checkAllWorkersCompleted = () => {
    if (workersCompleted.size === numWorkers && workersExited.size === numWorkers) {
        displayResults(initialTests); // Process and display results when all workers are done
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
    workersExited.add(projectName);
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
        console.log(`Starting ${test} tests on port ${port} by ${projectName} (${initialTests.length - tests.length}/${initialTests.length})`);
        worker.send({ test, port, projectName });
    }
};

/**
 * Displays the test results by reading the files in directories named after each test suite.
 * This function loops through each test directory and reads all files inside, then logs their contents.
 * @param {Array<string>} testSuites - An array of test suite names.
 * @returns {void} Does not return a value. Outputs to the console.
 */
const displayResults = (testSuites) => {
    console.log('\nTest results:');

    // Print all tests.log files
    testSuites.forEach((testSuiteName) => {
        const testDirectoryPath = `./database/storage/${testSuiteName}`;

        try {
            const files = fs.readdirSync(testDirectoryPath);

            files.forEach((file) => {
                if (file === 'tests.log') {
                    const filePath = path.join(testDirectoryPath, file);
                    const data = fs.readFileSync(filePath, 'utf8');
                    console.log(data);
                }
            });
        } catch (err) {
            console.error(`Error reading directory for ${testSuiteName}: ${err}`);
        }
    });

    console.log('\n');

    let totalPassing = 0;
    let totalFailing = 0;
    let totalPending = 0;

    // Loop through all results.log files and add the results
    testSuites.forEach((testSuiteName) => {
        const testDirectoryPath = `./database/storage/${testSuiteName}`;

        try {
            const files = fs.readdirSync(testDirectoryPath);

            files.forEach((file) => {
                if (file === 'results.log') {
                    const filePath = path.join(testDirectoryPath, file);
                    const data = fs.readFileSync(filePath, 'utf8');
                    const lines = data.split('\n');

                    lines.forEach((line) => {
                        const trimmedLine = line.trim(); // Trim leading and trailing spaces
                        if (trimmedLine.includes('Passing')) {
                            totalPassing += parseInt(trimmedLine.split(' ')[0], 10);
                        } else if (trimmedLine.includes('Failing')) {
                            totalFailing += parseInt(trimmedLine.split(' ')[0], 10);
                        } else if (trimmedLine.includes('Pending')) {
                            totalPending += parseInt(trimmedLine.split(' ')[0], 10);
                        }
                    });
                }
            });
        } catch (err) {
            console.error(`Error reading directory for ${testSuiteName}: ${err}`);
        }
    });

    // Print totals
    console.log('Total Passing:', totalPassing);
    console.log('Total Failing:', totalFailing);
    if (totalPending > 0) {
        console.log('Total Pending:', totalPending);
    }

    console.log('\n');

    // Print all fails.log files if not empty
    testSuites.forEach((testSuiteName) => {
        const testDirectoryPath = `./database/storage/${testSuiteName}`;

        try {
            const files = fs.readdirSync(testDirectoryPath);

            files.forEach((file) => {
                if (file === 'fails.log') {
                    const filePath = path.join(testDirectoryPath, file);
                    const data = fs.readFileSync(filePath, 'utf8');
                    if (data.trim()) { // Check if the file is not empty
                        console.log(data);
                    }
                }
            });
        } catch (err) {
            console.error(`Error reading directory for ${testSuiteName}: ${err}`);
        }
    });
};

startWorker();
