'use strict';

const bookkeepingServer = require('..');
const assert = require('assert').strict;

assert.strictEqual(bookkeepingServer(), 'Hello from bookkeepingServer');
console.info('bookkeepingServer tests passed');
