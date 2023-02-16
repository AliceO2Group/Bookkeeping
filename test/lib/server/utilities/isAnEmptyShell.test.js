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

const { expect } = require('chai');
const { isAnEmptyShell } = require('../../../../lib/server/utilities/isAnEmptyShell.js');

module.exports = () => {
    it('should successfully return true for an undefined value', () => {
        expect(isAnEmptyShell(undefined)).to.be.true;
    });

    it('should successfully return true for an object, or nested objects, with only undefined values', () => {
        expect(isAnEmptyShell({})).to.be.true;
        expect(isAnEmptyShell({ key1: undefined })).to.be.true;
    });

    it('should successfully return true for an array, or nested arrays, with only undefined values', () => {
        expect(isAnEmptyShell([])).to.be.true;
        expect(isAnEmptyShell([undefined])).to.be.true;
        expect(isAnEmptyShell([[[]]])).to.be.true;
        expect(isAnEmptyShell([[[undefined]]])).to.be.true;
    });

    it('should successfully return true for a complex structure that has only undefined elements', () => {
        expect(isAnEmptyShell({
            key1: {
                key2: [undefined, undefined, { key3: { key4: [undefined], key5: undefined } }, { key6: [] }, { key7: undefined }],
                key8: undefined,
                key9: [],
                key10: {},
            },
        })).to.be.true;
    });

    it('should successfully return false for any scalar value', () => {
        expect(isAnEmptyShell(null)).to.be.false;
        expect(isAnEmptyShell(23)).to.be.false;
        expect(isAnEmptyShell(-23)).to.be.false;
        expect(isAnEmptyShell(0)).to.be.false;
        expect(isAnEmptyShell(0.5)).to.be.false;
        expect(isAnEmptyShell(false)).to.be.false;
        expect(isAnEmptyShell(true)).to.be.false;
        expect(isAnEmptyShell('Hi')).to.be.false;
    });

    it('should successfully return false for an object with a not undefined property, even nested', () => {
        expect(isAnEmptyShell({ key1: null })).to.be.false;
        expect(isAnEmptyShell({ key1: { key2: 23 } })).to.be.false;
        expect(isAnEmptyShell({ key1: undefined, key2: { key3: undefined }, key4: 34 })).to.be.false;
    });

    it('should successfully return false for an array with a not undefined value, even nested', () => {
        expect(isAnEmptyShell([1])).to.be.false;
        expect(isAnEmptyShell([undefined, undefined, 'Hello', undefined])).to.be.false;
        expect(isAnEmptyShell([[], [[undefined]], [['Hello']], undefined])).to.be.false;
    });

    it('should successfully return false for a complex structure with not-null nested property or not empty array as property', () => {
        expect(isAnEmptyShell({ key1: { key2: [[1]] }, key3: { key4: {} } })).to.be.false;
        expect(isAnEmptyShell({ key1: { key2: {} }, key3: { key4: { key5: null } } })).to.be.false;
    });
};
