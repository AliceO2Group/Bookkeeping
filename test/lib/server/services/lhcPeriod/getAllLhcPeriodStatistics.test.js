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
const { getAllLhcPeriodStatistics } = require('../../../../../lib/server/services/lhcPeriod/getAllLhcPeriodStatistics.js');

module.exports = () => {
    it('should successfully return the statistics of all the LHC periods with their count', async () => {
        const { count, rows } = await getAllLhcPeriodStatistics();

        expect(rows.map(({ id }) => id)).to.have.members([1, 2, 3]);
        expect(count).to.equal(3);
    });

    it('should apply the given query builder configuration', async () => {
        const { rows } = await getAllLhcPeriodStatistics((queryBuilder) => {
            queryBuilder.where('id').is(2);
        });

        expect(rows.map(({ id }) => id)).to.eql([2]);
    });
};
