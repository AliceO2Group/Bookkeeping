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

const { Op } = require('sequelize');
const { LhcPeriodStatisticsRepository } = require('../../../database/repositories/index.js');
const { RunDefinition } = require('../../../domain/enums/RunDefinition.js');
const { RunQualities } = require('../../../domain/enums/RunQualities.js');

/**
 * Return the ids of the statistics of the LHC periods having at least one good physics run of one of the given PDP beam types
 *
 * @param {string[]} pdpBeamTypes the PDP beam types
 * @return {Promise<number[]>} resolves with the ids of the statistics
 */
exports.getLhcPeriodStatisticsIdsByPdpBeamTypes = async (pdpBeamTypes) => {
    const lhcPeriodsStatistics = await LhcPeriodStatisticsRepository.findAll({
        raw: true,
        include: {
            association: 'lhcPeriod',
            required: true,
            include: {
                association: 'runs',
                required: true,
                where: {
                    pdpBeamType: { [Op.in]: pdpBeamTypes },
                    definition: RunDefinition.PHYSICS,
                    runQuality: RunQualities.GOOD,
                },
            },
        },
    });

    return [...new Set(lhcPeriodsStatistics.map(({ id }) => id))];
};
