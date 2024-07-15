const Mocha = require('mocha');

const { Base } = Mocha.reporters;
const fs = require('fs');
const mkdirp = require('mkdirp');

/**
 * CustomReporter for Mocha that logs test results into separate files.
 *
 * @param {Mocha.Runner} runner - The Mocha runner instance.
 * @returns {CustomReporter} An instance of CustomReporter, set up with the given Mocha runner.
 */
function CustomReporter(runner) {
    Base.call(this, runner);

    const testType = process.env.TEST_TYPE || 'default';
    const basePath = `/var/storage/${testType}`;
    mkdirp.sync(basePath);

    const testsBuffer = [];
    const failsBuffer = [];
    const resultsBuffer = [];

    const suiteStack = [];
    const indent = '  ';
    let failCount = 0;

    /**
     * Event handler for 'suite' event, triggered when a suite begins.
     * Logs the suite title with indentation corresponding to its level in the suite hierarchy.
     *
     * @param {Mocha.Suite} suite - The Mocha suite instance.
     */
    runner.on('suite', (suite) => {
        if (suite.title && suite.title !== 'Bookkeeping') {
            suiteStack.push(suite.title);
            testsBuffer.push(`${indent.repeat(suiteStack.length)}${suite.title}`);
        }
    });

    /**
     * Event handler for 'suite end' event, triggered when a suite ends.
     * Manages the current suite context by popping the suite from the stack.
     *
     * @param {Mocha.Suite} suite - The Mocha suite instance.
     */
    runner.on('suite end', (suite) => {
        if (suite.title) {
            suiteStack.pop();
        }
    });

    /**
     * Event handler for 'pass' event, triggered when a test passes.
     * Logs a passing test message with indentation indicating its level within the suite.
     *
     * @param {Mocha.Test} test - The Mocha test instance that passed.
     */
    runner.on('pass', (test) => {
        testsBuffer.push(`${indent.repeat(suiteStack.length + 1)}✔ ${test.title} (${test.duration}ms)`);
    });

    /**
     * Event handler for 'fail' event, triggered when a test fails.
     * Logs a failing test message in the tests buffer and detailed error information in the fails buffer.
     *
     * @param {Mocha.Test} test - The Mocha test instance that failed.
     * @param {Error} err - The error that caused the test to fail.
     */
    runner.on('fail', (test, err) => {
        failCount += 1;
        testsBuffer.push(`${indent.repeat(suiteStack.length + 1)}${failCount}) ${test.title}`);

        suiteStack.forEach((title, idx) => {
            // Add the failCount only next to the "Home" line and an extra space to all subsequent lines.
            if (idx === 0) {
                // "Home" line with failCount prefixed.
                failsBuffer.push(`${indent.repeat(idx + 1)}${failCount}) ${title}`);
            } else {
                // Subsequent lines with one extra space.
                failsBuffer.push(`${indent.repeat(idx + 2)} ${title}`);
            }
        });

        // Add one additional indent level to all subsequent details.
        const detailIndentDouble = indent.repeat(suiteStack.length + 2);
        const detailIndentSingle = indent.repeat(suiteStack.length);
        failsBuffer.push(`${detailIndentDouble} ${test.title}:`);
        failsBuffer.push(`\n${detailIndentSingle} AssertionError: ${err.message}`);
        failsBuffer.push(`${detailIndentSingle} + expected - actual`);
        failsBuffer.push(`\n${detailIndentSingle} -${err.actual}`);
        failsBuffer.push(`${detailIndentSingle} +${err.expected}`);
        failsBuffer.push(`\n${detailIndentSingle} at ${err.stack}`);

        // Add a blank line after each failure for better readability
        failsBuffer.push('\n');
    });

    /**
     * Event handler for 'pending' event, triggered when a test is pending.
     * Logs a pending test message with indentation indicating its level within the suite.
     *
     * @param {Mocha.Test} test - The Mocha test instance that is pending.
     */
    runner.on('pending', (test) => {
        testsBuffer.push(`${indent.repeat(suiteStack.length + 1)}- ${test.title}`);
    });

    /**
     * Event handler for 'end' event, triggered when all tests have completed.
     * Logs the final passing, failing, and pending counts to the results buffer and writes all buffers to their respective files.
     */
    runner.on('end', () => {
        if (testsBuffer.length > 0) {
            fs.writeFileSync(`${basePath}/tests.log`, testsBuffer.join('\n'));
        }
        if (failsBuffer.length > 0) {
            fs.writeFileSync(`${basePath}/fails.log`, failsBuffer.join('\n'));
        }
        resultsBuffer.push(`${indent}${runner.stats.passes} Passing`);
        resultsBuffer.push(`${indent}${runner.stats.failures} Failing`);
        resultsBuffer.push(`${indent}${runner.stats.pending} Pending`);
        if (resultsBuffer.length > 0) {
            fs.writeFileSync(`${basePath}/results.log`, resultsBuffer.join('\n'));
        }
    });
}

module.exports = CustomReporter;
