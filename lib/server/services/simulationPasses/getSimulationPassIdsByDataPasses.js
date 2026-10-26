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

const { Op } = require('sequelize');
const { SimulationPassRepository } = require('../../../database/repositories/index.js');

/**
 * Return the ids of the simulation passes linked to at least one of the given data passes
 *
 * @param {number[]} dataPassIds the ids of the data passes
 * @return {Promise<number[]>} resolves with the ids of the simulation passes
 */
exports.getSimulationPassIdsByDataPasses = async (dataPassIds) => {
    const simulationPasses = await SimulationPassRepository.findAll({
        raw: true,
        include: {
            association: 'dataPasses',
            where: { id: { [Op.in]: dataPassIds } },
        },
    });

    return [...new Set(simulationPasses.map(({ id }) => id))];
};
