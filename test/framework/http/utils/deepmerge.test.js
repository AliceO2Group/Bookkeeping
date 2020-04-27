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

const { deepmerge } = require('../../../../lib/http/utils');
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
};
