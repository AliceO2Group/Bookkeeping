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

    const testsStream = fs.createWriteStream(`${basePath}/tests.log`, { flags: 'w' });
    const failsStream = fs.createWriteStream(`${basePath}/fails.log`, { flags: 'w' });
    const resultsStream = fs.createWriteStream(`${basePath}/results.log`, { flags: 'w' });

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
            testsStream.write(`${indent.repeat(suiteStack.length)}${suite.title}\n`);
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
        testsStream.write(`${indent.repeat(suiteStack.length + 1)}✔ ${test.title} (${test.duration}ms)\n`);
    });

    /**
     * Event handler for 'fail' event, triggered when a test fails.
     * Logs a failing test message in the tests stream and detailed error information in the fails stream.
     *
     * @param {Mocha.Test} test - The Mocha test instance that failed.
     * @param {Error} err - The error that caused the test to fail.
     */
    runner.on('fail', (test, err) => {
        failCount += 1;
        testsStream.write(`${indent.repeat(suiteStack.length + 1)}${failCount}) ${test.title}\n`);

        suiteStack.forEach((title, idx) => {
            // Add the failCount only next to the "Home" line and an extra space to all subsequent lines.
            if (idx === 0) {
                // "Home" line with failCount prefixed.
                failsStream.write(`${indent.repeat(idx + 1)}${failCount}) ${title}\n`);
            } else {
                // Subsequent lines with one extra space.
                failsStream.write(`${indent.repeat(idx + 2)} ${title}\n`);
            }
        });

        // Add one additional indent level to all subsequent details.
        const detailIndentDouble = indent.repeat(suiteStack.length + 2);
        const detailIndentSingle = indent.repeat(suiteStack.length);
        failsStream.write(`${detailIndentDouble} ${test.title}:\n\n`);
        failsStream.write(`${detailIndentSingle} AssertionError: ${err.message}\n`);
        failsStream.write(`${detailIndentSingle} + expected - actual\n\n`);
        failsStream.write(`${detailIndentSingle} -${err.actual}\n`);
        failsStream.write(`${detailIndentSingle} +${err.expected}\n\n`);
        failsStream.write(`${detailIndentSingle} at ${err.stack}\n\n`);
    });

    /**
     * Event handler for 'end' event, triggered when all tests have completed.
     * Logs the final passing and failing counts to the results stream and closes all streams.
     */
    runner.on('end', () => {
        resultsStream.write(`${indent}${runner.stats.passes} Passing\n${indent}${runner.stats.failures} Failing\n`);
        testsStream.end();
        failsStream.end();
        resultsStream.end();
    });
}

module.exports = CustomReporter;
