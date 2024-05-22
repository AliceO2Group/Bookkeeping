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

const { getOneSimulationPass } = require('./getOneSimulationPass.js');
const { NotFoundError } = require('../../errors/NotFoundError.js');

/**
 * Find and return a simulation pass by its id or name, and throw if none is found
 *
 * @param {SimulationPassIdentifier} identifier the identifier of the simulation pass to fetch
 * @param {(function(QueryBuilder):void)|null} [qbConfiguration=null] function called with the simulation pass find query builder as parameter
 *     to add specific configuration to the query
 * @return {Promise<SequelizeSimulationPass>} resolves with the found simulation pass
 */
exports.getOneSimulationPassOrFail = async (identifier, qbConfiguration = null) => {
    const simulationPass = await getOneSimulationPass(identifier, qbConfiguration);

    if (!simulationPass) {
        const { id, name } = identifier;
        const criteriaExpression = id !== undefined && id !== null ? `id (${id})` : `name (${name})`;
        throw new NotFoundError(`Simulation pass with this ${criteriaExpression} could not be found`);
    }

    return simulationPass;
};
