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
const { timestampToMysql } = require('../../server/utilities/timestampToMysql.js');

/**
 * Return the raw query to execute to fetch the histogram of time elapsed between runs in a given period
 *
 * @param {Period} period the runs must intersect with this period to be included in the statistics
 * @param {number} timeWindow the time window of the bins, in seconds
 * @param {number} restWindow after this time, run duration is considered to be this time (to do the "more than" histogram bin)
 * @return {string} the raw SQL query
 */
const getTimeBetweenRunsHistogramQuery = ({ from, to }, timeWindow, restWindow) => `
    SELECT COUNT(*) count, FLOOR(LEAST(full.timeBetweenRuns, ${60 * restWindow}) / (${60 * timeWindow})) offset
    FROM (
             SELECT IF(LAG(sbr.fill_number) OVER w = sbr.fill_number,
                       IFNULL(TO_SECONDS(sbr.sb_run_start) - LAG(TO_SECONDS(sbr.sb_run_end)) OVER w, 0),
                       NULL) timeBetweenRuns,
                    sbr.sb_run_start,
                    sbr.sb_run_end
             FROM stable_beam_runs sbr
                      INNER JOIN runs r ON r.run_number = sbr.run_number
             WHERE r.definition = 'PHYSICS'
             WINDOW w AS (ORDER BY sbr.fill_number DESC, sbr.sb_run_start)
             ORDER BY sbr.fill_number DESC, sbr.sb_run_start
         ) AS full
    WHERE full.timeBetweenRuns IS NOT NULL
      AND full.sb_run_end >= '${timestampToMysql(from)}'
      AND full.sb_run_start < '${timestampToMysql(to)}'
    GROUP BY FLOOR(LEAST(full.timeBetweenRuns, ${60 * restWindow}) / (${60 * timeWindow}))
    ORDER BY full.timeBetweenRuns;
`;

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

    /**
     * Return the time between runs histogram (15 minutes window)
     *
     * @param {Period} period the period of statistics to query
     * @param {number} timeWindow the time window of the bins, in seconds
     * @param {number} restWindow after this time, run duration is considered to be this time (to do the "more than" histogram bin)
     * @return {Promise<HistogramBin[]>} the resulting histogram bins
     */
    async getTimeBetweenRunsDistribution(period, timeWindow, restWindow) {
        const [rows] = await sequelize.query(getTimeBetweenRunsHistogramQuery(period, timeWindow, restWindow), { raw: true });
        return rows;
    }
}

module.exports = new StableBeamRunsRepository();
