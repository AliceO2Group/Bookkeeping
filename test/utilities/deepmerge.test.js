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

const { deepmerge } = require('../../lib/utilities');
const chai = require('chai');

const { expect } = chai;

module.exports = () => {
    it('should merge two objects recursively', () => {
        const source = {
            a: 1,
            b: 2,
            moreLetters: {
                x: 42,
                y: null,
            },
        };
        const overwrite = {
            c: 4,
            moreLetters: {
                y: 'Not a Number',
                z: 123,
            },
        };

        const expectedResult = {
            a: 1,
            b: 2,
            c: 4,
            moreLetters: {
                x: 42,
                y: 'Not a Number',
                z: 123,
            },
        };

        expect(deepmerge(source, overwrite)).to.deep.include(expectedResult);
    });

    it('should merge two objects recursively', () => {
        const source = {
            a: 1,
            b: 2,
            moreLetters: {
                x: 42,
                y: null,
            },
        };

        const overwrite = {
            c: 4,
            moreLetters: {
                y: 'Not a Number',
                z: 123,
            },
        };

        const yetAnotherOverwrite = {
            c: 6,
            moreLetters: {
                y: 'Not a String',
            },
        };

        const expectedResult = {
            a: 1,
            b: 2,
            c: 6,
            moreLetters: {
                x: 42,
                y: 'Not a String',
                z: 123,
            },
        };

        expect(deepmerge(source, overwrite, yetAnotherOverwrite)).to.deep.include(expectedResult);
    });

    it('should return the base object if no targets are provided', () => {
        const base = {
            id: 1,
            values: [1, '2', 3],
        };

        expect(deepmerge(base)).to.deep.equal(base);
    });
};
