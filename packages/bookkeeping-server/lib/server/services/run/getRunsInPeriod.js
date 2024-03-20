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

const { RunRepository } = require('../../../database/repositories/index.js');
const { Op } = require('sequelize');
const { sequelize } = require('../../../database');
const { runIncludeClauseFromRelations } = require('./runIncludeClauseFromRelations.js');

const RUN_CONSIDERED_LOST_AFTER = 48 * 3600 * 1000;

/**
 * Return the list of runs that intersect with a given period
 *
 * @param {Period} period the period in which runs should be fetched
 * @param {RunRelationsToInclude} [relations={}] the relations of the fetched runs to include
 * @return {Promise<SequelizeRun[]>} the list of runs in the given shift
 */
exports.getRunsInPeriod = async (period, relations = {}) => RunRepository.findAll({
    where: {

        /*
         * Run is in the shift if:
         * It started before the end of the shift
         * AND it stopped after the start of the shift
         */

        [Op.and]: [
            // Run has started
            {
                [Op.or]: [
                    { [Op.not]: { timeTrgStart: null } },
                    { [Op.not]: { timeO2Start: null } },
                ],
            },
            // Run is not lost
            {
                [Op.or]: [
                    // We know the run stop
                    { [Op.not]: { timeTrgEnd: null } },
                    { [Op.not]: { timeO2End: null } },
                    // Or the run has started less than 48 hours ago
                    sequelize.where(
                        sequelize.fn('COALESCE', sequelize.col('time_trg_start'), sequelize.col('time_o2_start')),
                        '>=',
                        new Date(Date.now() - RUN_CONSIDERED_LOST_AFTER),
                    ),
                ],
            },
            // Run started before the end of the shift
            sequelize.where(
                sequelize.fn('COALESCE', sequelize.col('time_trg_start'), sequelize.col('time_o2_start')),
                '<',
                new Date(period.to),
            ),
            // Run ended after the start of the shift
            sequelize.where(
                sequelize.fn('COALESCE', sequelize.col('time_trg_end'), sequelize.col('time_o2_end'), sequelize.fn('NOW')),
                '>=',
                new Date(period.from),
            ),
        ],
    },
    include: runIncludeClauseFromRelations(relations),
});
