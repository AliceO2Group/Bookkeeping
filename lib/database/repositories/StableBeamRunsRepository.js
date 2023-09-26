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

const { models: { StableBeamRun }, sequelize } = require('../');
const Repository = require('./Repository.js');
const { Op } = require('sequelize');
const { RunQualities } = require('../../domain/enums/RunQualities.js');
const { RunDefinition } = require('../../server/services/run/getRunDefinition.js');

/**
 * Sequelize implementation of repository managing {@see StableBeamRun}
 */
class StableBeamRunsRepository extends Repository {
    /**
     * Constructor
     */
    constructor() {
        super(StableBeamRun);
    }

    /**
     * Return the weekly data size of physics runs in a given period
     *
     * @param {Period} period the period to which runs are limited
     * @return {Promise<WeeklyDataSize[]>} the weekly data size
     */
    async getWeeklyDataSize({ from, to }) {
        return await this.model.findAll({
            where: {
                sbRunStart: { [Op.lt]: to },
                sbRunEnd: { [Op.gte]: from },
            },
            attributes: [
                [sequelize.fn('YEAR', sequelize.col('run.time_start')), 'year'],
                [sequelize.fn('WEEK', sequelize.col('run.time_start')), 'week'],
                [sequelize.literal('SUM(run.tf_file_size + run.ctf_file_size)'), 'size'],
            ],
            include: {
                association: 'run',
                where: {
                    definition: RunDefinition.Physics,
                    runQuality: RunQualities.GOOD,
                },
                attributes: ['time_start', 'tf_file_size', 'ctf_file_size'],
            },
            group: [sequelize.fn('YEAR', sequelize.col('run.time_start')), sequelize.fn('WEEK', sequelize.col('run.time_start'))],
            raw: true,
        });
    }
}

module.exports = new StableBeamRunsRepository();
