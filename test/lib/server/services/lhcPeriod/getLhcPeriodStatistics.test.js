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
const { getLhcPeriodStatistics } = require('../../../../../lib/server/services/lhcPeriod/getLhcPeriodStatistics.js');
const { BadParameterError } = require('../../../../../lib/server/errors/BadParameterError.js');

module.exports = () => {
    it('should successfully find the statistics of an LHC period by id', async () => {
        expect((await getLhcPeriodStatistics({ id: 1 })).id).to.equal(1);
    });

    it('should successfully find the statistics of an LHC period by name', async () => {
        expect((await getLhcPeriodStatistics({ name: 'LHC22b' })).id).to.equal(2);
    });

    it('should return null when no LHC period matches', async () => {
        expect(await getLhcPeriodStatistics({ id: 99999 })).to.be.null;
        expect(await getLhcPeriodStatistics({ name: 'LHC00z' })).to.be.null;
    });

    it('should apply the given query builder configuration', async () => {
        const lhcPeriodStatistics = await getLhcPeriodStatistics({ id: 1 }, (queryBuilder) => queryBuilder.set('attributes', ['id']));

        expect(Object.keys(lhcPeriodStatistics.get())).to.eql(['id']);
    });

    it('should reject when neither the id nor the name is given', async () => {
        await assert.rejects(() => getLhcPeriodStatistics({}), new BadParameterError('Can not find without LHC Period id or name'));
    });
};
