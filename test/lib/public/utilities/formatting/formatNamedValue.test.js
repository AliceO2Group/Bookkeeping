/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

const { expect } = require('chai');

let formatNamedValue;

module.exports = () => {
    before(async () => {
        ({ formatNamedValue } = await import('../../../../../lib/public/utilities/formatting/formatNamedValue.js'));
    });

    it('should return value.name when value is an object with a name property', () => {
        expect(formatNamedValue({ name: 'John Doe' })).to.equal('John Doe');
        expect(formatNamedValue({ name: 'Test', id: 123 })).to.equal('Test');
    });

    it('should return value when value is a string, number or a boolean', () => {
        expect(formatNamedValue('Plain String')).to.equal('Plain String');
        expect(formatNamedValue(42)).to.equal(42);
        expect(formatNamedValue(true)).to.equal(true);
    });

    it('should return "-" when value is null or undefined', () => {
        expect(formatNamedValue(null)).to.equal('-');
        expect(formatNamedValue(undefined)).to.equal('-');
    });

    it('should return "-" when value.name is null or undefined', () => {
        expect(formatNamedValue({name: undefined})).to.equal('-');
        expect(formatNamedValue({name: null})).to.equal('-');
    });

    it('should correctly handle falsy but defined values', () => {
        expect(formatNamedValue('')).to.equal('');
        expect(formatNamedValue(0)).to.equal(0);
        expect(formatNamedValue(false)).to.equal(false);
    });
};
