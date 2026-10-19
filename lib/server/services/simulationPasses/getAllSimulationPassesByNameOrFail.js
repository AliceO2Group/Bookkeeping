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

const { repositories: { SimulationPassRepository }, utilities: { QueryBuilder } } = require('../../../database');
const { NotFoundError } = require('../../errors/NotFoundError.js');

/**
 * Extract all the simulation passes (id and name only) corresponding to a list of simulation pass names.
 * If any do not correspond to a simulation pass, throw an error
 *
 * @param {string[]} [simulationPassNames] the list of simulation pass names
 * @return {Promise<{id: number, name: string}[]>} the list of simulation passes
 */
const getAllSimulationPassesByNameOrFail = async (simulationPassNames) => {
    if (!simulationPassNames || simulationPassNames.length === 0) {
        return [];
    }

    const queryBuilder = new QueryBuilder()
        .set('attributes', ['id', 'name'])
        .where('name').oneOf(...simulationPassNames);

    const simulationPasses = await SimulationPassRepository.findAll(queryBuilder);

    const foundNames = new Set(simulationPasses.map(({ name }) => name));
    const missingNames = simulationPassNames.filter((name) => !foundNames.has(name));
    if (missingNames.length > 0) {
        throw new NotFoundError(missingNames.length === 1
            ? `Simulation pass with this name (${missingNames[0]}) could not be found`
            : `Simulation passes with these names (${missingNames.join(', ')}) could not be found`);
    }

    return simulationPasses;
};

exports.getAllSimulationPassesByNameOrFail = getAllSimulationPassesByNameOrFail;
