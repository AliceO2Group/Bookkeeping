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
const { NotFoundError } = require('../../../../../lib/server/errors/NotFoundError.js');
const {
    getAllSimulationPassesByNameOrFail,
} = require('../../../../../lib/server/services/simulationPasses/getAllSimulationPassesByNameOrFail.js');

module.exports = () => {
    it('should successfully return the simulation passes matching the given names', async () => {
        const simulationPasses = await getAllSimulationPassesByNameOrFail(['LHC23k6c', 'LHC23k6b']);

        expect(simulationPasses.map(({ name }) => name)).to.have.members(['LHC23k6c', 'LHC23k6b']);
        expect(simulationPasses.every(({ id }) => typeof id === 'number')).to.be.true;
    });

    it('should return an empty list when no names are given', async () => {
        expect(await getAllSimulationPassesByNameOrFail([])).to.deep.equal([]);
        expect(await getAllSimulationPassesByNameOrFail(undefined)).to.deep.equal([]);
    });

    it('should throw when one of the simulation passes can not be found', async () => {
        await assert.rejects(
            () => getAllSimulationPassesByNameOrFail(['LHC23k6c', 'NOT_A_SIMULATION_PASS']),
            new NotFoundError('Simulation pass with this name (NOT_A_SIMULATION_PASS) could not be found'),
        );
    });

    it('should throw listing every missing simulation pass', async () => {
        await assert.rejects(
            () => getAllSimulationPassesByNameOrFail(['LHC23k6c', 'MISSING_1', 'MISSING_2']),
            new NotFoundError('Simulation passes with these names (MISSING_1, MISSING_2) could not be found'),
        );
    });
};
