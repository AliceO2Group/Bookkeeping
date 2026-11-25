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
const assert = require('assert');
const { getLhcPeriodStatisticsOrFail } = require('../../../../../lib/server/services/lhcPeriod/getLhcPeriodStatisticsOrFail.js');
const { NotFoundError } = require('../../../../../lib/server/errors/NotFoundError.js');

module.exports = () => {
    it('should successfully return the statistics of an LHC period', async () => {
        expect((await getLhcPeriodStatisticsOrFail({ id: 1 })).id).to.equal(1);
        expect((await getLhcPeriodStatisticsOrFail({ name: 'LHC22b' })).id).to.equal(2);
    });

    it('should fail when no LHC period has the given id', async () => {
        await assert.rejects(
            () => getLhcPeriodStatisticsOrFail({ id: 99999 }),
            new NotFoundError('LHC Period with this id (99999) could not be found'),
        );
    });

    it('should fail when no LHC period has the given name', async () => {
        await assert.rejects(
            () => getLhcPeriodStatisticsOrFail({ name: 'LHC00z' }),
            new NotFoundError('LHC Period with this name (LHC00z) could not be found'),
        );
    });
};
