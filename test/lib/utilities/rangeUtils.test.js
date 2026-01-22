/**
 * @license
 * Copyright CERN and copyright holders of ALICE O2. This software is
 * distributed under the terms of the GNU General Public License v3 (GPL
 * Version 3), copied verbatim in the file "COPYING".
 *
 * See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

const Sinon = require('sinon');
const { validateRange, unpackNumberRange } = require('../../../lib/utilities/rangeUtils.js');
const { expect } = require('chai');

module.exports = () => {
    describe('validateRange()', () => {
        let helpers;

        beforeEach(() => {
            helpers = {
                error: Sinon.stub()
            };
        });

        it('returns the original value for a single valid number', () => {
            const input = '5';
            const result = validateRange(input, helpers);
            expect(result).to.equal(input);
        });

        it('returns the original value, accepts 0', () => {
            const input = '0,1';
            const result = validateRange(input, helpers);
            expect(result).to.equal(input);
        });

        it('returns the original value for multiple valid numbers', () => {
            const input = '1, 2,3, 10 ';
            const result = validateRange(input, helpers);
            expect(result).to.equal(input);
        });

        it('accepts a valid range', () => {
            const input = '7-9';
            const result = validateRange(input, helpers);
            expect(result).to.equal(input);
        });

        it('accepts numbers and ranges together', () => {
            const input = '5,7-9,12';
            const result = validateRange(input, helpers);
            expect(result).to.equal(input);
        });

        it('accepts numbers and ranges overlap', () => {
            const input = '1-6,2,3,4,5,6';
            const result = validateRange(input, helpers);
            expect(result).to.equal(input);
        });

        it('rejects non-numeric input', () => {
            const input = '5,a,7';
            validateRange(input, helpers);
            expect(helpers.error.calledOnce).to.be.true;
            expect(helpers.error.firstCall.args[0]).to.equal('any.invalid');
            expect(helpers.error.firstCall.args[1]).to.deep.equal({ message: 'Invalid number: a' });
        });

        it('rejects range with non-numeric input', () => {
            const input = '3-a';
            validateRange(input, helpers);
            expect(helpers.error.calledOnce).to.be.true;
            expect(helpers.error.firstCall.args[1]).to.deep.equal({ message: 'Invalid range: 3-a' });
        });

        it('rejects range where Start > End', () => {
            const input = '6-5';
            validateRange(input, helpers);
            expect(helpers.error.calledOnce).to.be.true;
            expect(helpers.error.firstCall.args[1]).to.deep.equal({ message: 'Invalid range: 6-5' });
        });

        // Allowed, technically a valid range
        it('accepts range where Start === End', () => {
            const input = '5-5';
            const result = validateRange(input, helpers);
            expect(result).to.equal(input);
        });

        it('rejects range containing more than one `-`', () => {
            const input = '1-2-3';
            validateRange(input, helpers);
            expect(helpers.error.calledOnce).to.be.true;
            expect(helpers.error.firstCall.args[1]).to.deep.equal({ message: 'Invalid range: 1-2-3' });
        });

        it('rejects range containing more than one `-`, at end', () => {
            const input = '1-2-';
            validateRange(input, helpers);
            expect(helpers.error.calledOnce).to.be.true;
            expect(helpers.error.firstCall.args[1]).to.deep.equal({ message: 'Invalid range: 1-2-' });
        });

        // MAX_RANGE_SIZE = 100, should this change, also change this test...
        it('rejects a range that exceeds MAX_RANGE_SIZE', () => {
            const input = '1-101';
            validateRange(input, helpers);
            expect(helpers.error.calledOnce).to.be.true;
            expect(helpers.error.firstCall.args[1]).to.deep.equal({ message: 'Given range exceeds max size of 100 range: 1-101' });
        });

        it('handles whitespace around inputs', () => {
            const input = '  2 , 4-6 ,  9 ';
            const result = validateRange(input, helpers);
            expect(result).to.equal(input);
        });
    });

    describe('unpackNumberRange()', () => {
        it('unpacks single numbers, duplicate', () => {
            const input = ['5', '10', '5'];
            const result = unpackNumberRange(input);
            expect(Array.from(result)).to.deep.equal([5, 10]);
        });

        it('unpacks range', () => {
            const input = ['7-9'];
            const result = unpackNumberRange(input);
            expect(Array.from(result)).to.deep.equal([7, 8, 9]);
        });

        it('unpacks mixed numbers and ranges', () => {
            const input = ['5', '7-9', '9', '3-4'];
            const result = unpackNumberRange(input);
            expect(Array.from(result)).to.deep.equal([5, 7, 8, 9, 3, 4]);
        });

        it('ignores any non-numeric inputs', () => {
            const input = ['5', 'x', '2-3', 'a-b', '4-a'];
            const result = unpackNumberRange(input);
            expect(Array.from(result)).to.deep.equal([5, 2, 3]);
        });

        it('accepts/uses a range splitter', () => {
            const input = ['8..10', '12'];
            const result = unpackNumberRange(input, '..');
            expect(Array.from(result)).to.deep.equal([8, 9, 10, 12]);
        });
        
        // Also allowed right now...
        it('returns empty set if nothing is given', () => {
            const result = unpackNumberRange([]);
            expect(result.size).to.equal(0);
        });
    });
};
