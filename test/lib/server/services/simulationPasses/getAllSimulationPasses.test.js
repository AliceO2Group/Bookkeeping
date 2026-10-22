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
const { getAllSimulationPasses } = require('../../../../../lib/server/services/simulationPasses/getAllSimulationPasses.js');

module.exports = () => {
    it('should successfully return all the simulation passes with their count', async () => {
        const { count, rows } = await getAllSimulationPasses();

        expect(rows.map(({ name }) => name)).to.have.members(['LHC23k6c', 'LHC23k6b', 'LHC23k6a']);
        expect(count).to.equal(3);
    });

    it('should apply the given query builder configuration', async () => {
        const { rows } = await getAllSimulationPasses((queryBuilder) => {
            queryBuilder.where('name').is('LHC23k6b');
        });

        expect(rows.map(({ name }) => name)).to.eql(['LHC23k6b']);
    });
};
