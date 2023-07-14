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
const { LhcFillStatisticsRepository } = require('../../../database/repositories/index.js');
const { lhcFillStatisticsAdapter } = require('../../../database/adapters/index.js');
const { Op } = require('sequelize');

/**
 * Service providing fill and runs statistics
 */
class StatisticsService {
    /**
     * Return the LHC fill statistics for a given period
     *
     * @param {Period} period the period of statistics to query
     * @return {Promise<LhcFillStatistics[]>} the statistics
     */
    async getLhcFillStatistics({ from, to }) {
        return (await LhcFillStatisticsRepository.findAll({
            include: {
                association: 'lhcFill',
                where: {
                    stableBeamsStart: { [Op.lt]: to },
                    stableBeamsEnd: { [Op.gt]: from },
                },
            },
        })).map(lhcFillStatisticsAdapter.toEntity);
    }
}

exports.StatisticsService = StatisticsService;

exports.statisticsService = new StatisticsService();
