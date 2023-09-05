/*
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
const { bigIntToLong, longToBigInt } = require('../../../../lib/server/utilities/bigIntConverter.js');
const { Long } = require('@grpc/proto-loader');

module.exports = () => {
    it('should successfully convert unsigned BigInt to Long', () => {
        const long = bigIntToLong(0xFFFFFFFFFFFFFFFFn, true).toString(16);
        expect(long.toString(16).toLowerCase()).to.equal('ffffffffffffffff');
    });
    it('should successfully convert signed BigInt to Long', () => {
        expect(bigIntToLong(-0x7FFFFFFFFFFFFFFFn, false)
            .toString(16)
            .toLowerCase()).to.equal('-7fffffffffffffff');
        expect(bigIntToLong(0x7FFFFFFFFFFFFFFFn, false)
            .toString(16)
            .toLowerCase()).to.equal('7fffffffffffffff');
    });
    it('should successfully convert unsigned Long to BigInt', () => {
        expect(longToBigInt(Long.fromString('FFFFFFFFFFFFFFFF', true, 16))).to.equal(0xFFFFFFFFFFFFFFFFn);
    });
    it('should successfully convert signed Long to BigInt', () => {
        expect(longToBigInt(Long.fromString('7FFFFFFFFFFFFFFF', false, 16))).to.equal(0x7FFFFFFFFFFFFFFFn);
        expect(longToBigInt(Long.fromString('-7FFFFFFFFFFFFFFF', false, 16))).to.equal(-0x7FFFFFFFFFFFFFFFn);
    });
};
