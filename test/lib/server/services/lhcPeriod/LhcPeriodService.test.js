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

const { lhcPeriodService } = require('../../../../../lib/server/services/lhcPeriod/LhcPeriodService.js');
const { expect } = require('chai');
const { resetDatabaseContent } = require('../../../../utilities/resetDatabaseContent.js');

module.exports = () => {
    before(resetDatabaseContent);

    it('should succesfully get by id', async () => {
        const lhcPeriod = await lhcPeriodService.getById({ id: 1 });
        expect(lhcPeriod.id).to.be.equal(1);
        expect(lhcPeriod.name).to.be.equal('LHC22a');
    });

    it('should succesfully get all data', async () => {
        const { rows: lhcPeriods } = await lhcPeriodService.getAllForPhysicsRuns();
        expect(lhcPeriods).to.be.lengthOf(2);
    });

    it('should succesfully filter period statistics on names', async () => {
        const dto = {
            query: {
                filter: {
                    names: 'LHC22a',
                },
            },
        };
        const { rows: lhcPeriods } = await lhcPeriodService.getAllForPhysicsRuns(dto);
        expect(lhcPeriods).to.be.lengthOf(1);
    });

    it('should succesfully filter period statistics on ids', async () => {
        const dto = {
            query: {
                filter: {
                    ids: '1,2',
                },
            },
        };
        const { rows: lhcPeriods } = await lhcPeriodService.getAllForPhysicsRuns(dto);
        expect(lhcPeriods).to.be.lengthOf(2);
    });
};
