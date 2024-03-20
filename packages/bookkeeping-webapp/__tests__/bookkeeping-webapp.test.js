'use strict';

const bookkeepingWebapp = require('..');
const assert = require('assert').strict;

assert.strictEqual(bookkeepingWebapp(), 'Hello from bookkeepingWebapp');
console.info('bookkeepingWebapp tests passed');
