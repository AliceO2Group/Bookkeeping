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

const { getAllRunTypes } = require('../../../../../lib/server/services/runType/getAllRunTypes.js');
const { expect } = require('chai');

module.exports = () => {
    it('should successfully return all the run types', async () => {
        const runTypes = await getAllRunTypes();
        expect(runTypes.length).to.be.greaterThan(2);
        expect(runTypes.map(({ name }) => name)).to.include('NONE');
    });

    it('should apply the given query builder configuration', async () => {
        const ascendingIds = (await getAllRunTypes((queryBuilder) => queryBuilder.orderBy('name', 'asc'))).map(({ id }) => id);
        const descendingIds = (await getAllRunTypes((queryBuilder) => queryBuilder.orderBy('name', 'desc'))).map(({ id }) => id);
        expect(ascendingIds).to.eql([...descendingIds].reverse());

        expect(await getAllRunTypes((queryBuilder) => queryBuilder.limit(1))).to.lengthOf(1);
    });
};
