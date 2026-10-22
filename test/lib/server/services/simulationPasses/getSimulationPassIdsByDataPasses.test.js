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
    getSimulationPassIdsByDataPasses,
} = require('../../../../../lib/server/services/simulationPasses/getSimulationPassIdsByDataPasses.js');

module.exports = () => {
    it('should successfully return the ids of the simulation passes linked to the given data passes', async () => {
        expect(await getSimulationPassIdsByDataPasses([1])).to.eql([1]);
    });

    it('should return an empty list when no simulation pass is linked to the given data passes', async () => {
        expect(await getSimulationPassIdsByDataPasses([9999])).to.eql([]);
    });
};
