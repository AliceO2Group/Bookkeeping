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
const {
    getSimulationPassIdsByLhcPeriods,
} = require('../../../../../lib/server/services/simulationPasses/getSimulationPassIdsByLhcPeriods.js');

module.exports = () => {
    it('should successfully return the ids of the simulation passes linked to the data passes of the given LHC periods', async () => {
        expect(await getSimulationPassIdsByLhcPeriods([1])).to.have.members([2, 3]);
    });

    it('should return each simulation pass once even if several of its data passes belong to the periods', async () => {
        const ids = await getSimulationPassIdsByLhcPeriods([1, 2, 3]);

        expect(ids).to.have.lengthOf(new Set(ids).size);
    });

    it('should return an empty list when no simulation pass is linked to the given LHC periods', async () => {
        expect(await getSimulationPassIdsByLhcPeriods([9999])).to.eql([]);
    });
};
