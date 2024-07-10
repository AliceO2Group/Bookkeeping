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
            stdio: ['ignore', 'ignore', 'ignore', 'ipc'], // Redirect stdout and stderr to 'ignore', keep IPC open
        });
        worker.on('message', (msg) => handleWorkerMessage(msg, worker, port, projectName));
        worker.on('exit', (code) => logWorkerExit(code, projectName));

        assignTestToWorker(worker, port, projectName);
        workers.push(worker);
    }
};

/**
 * Handles messages from worker processes.
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
            console.log(`${projectName} starting new suite: ${test} (${initialTestAmount - tests.length}/${initialTestAmount})`);
            worker.send({ test, port, projectName });
        } else {
            console.log(`${projectName} found no more tests...`);
            worker.send('no_more_tests');
        }
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

startWorker();
