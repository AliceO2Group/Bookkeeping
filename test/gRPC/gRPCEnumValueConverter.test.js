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
const { toGRPCEnum, fromGRPCEnum } = require('../../lib/server/gRPC/services/enumConverter/gRPCEnumValueConverter.js');
const { RunQualities } = require('../../lib/domain/enums/RunQualities.js');

module.exports = () => {
    it('should successfully convert between js to gRPC enums values', () => {
        expect(toGRPCEnum('MyEnum', 'VALUE')).to.equal('MY_ENUM_VALUE');

        // Specific case for run quality
        expect(toGRPCEnum('RunQuality', RunQualities.GOOD)).to.equal('RUN_QUALITY_GOOD');
    });

    it('should successfully convert between gRPC to js enums values', () => {
        expect(fromGRPCEnum('MyEnum', 'MY_ENUM_VALUE')).to.equal('VALUE');
        expect(() => fromGRPCEnum('MyEnum', 'INVALID_VALUE')).to.throw('Invalid enum value INVALID_VALUE for enum MyEnum');

        // Specific case for run quality
        expect(fromGRPCEnum('RunQuality', 'RUN_QUALITY_GOOD')).to.equal(RunQualities.GOOD);
    });
};
