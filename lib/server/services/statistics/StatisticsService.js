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
const { LhcFillStatisticsRepository, StableBeamRunsRepository } = require('../../../database/repositories/index.js');
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
                    stableBeamsEnd: { [Op.gte]: from },
                },
            },
        })).map(lhcFillStatisticsAdapter.toEntity);
    }

    /**
     * Return the data size per week for a given period
     *
     * @param {Period} period the period of statistics to query
     * @return {Promise<WeeklyDataSize[]>} the weekly data size
     */
    async getWeeklyDataSize(period) {
        return (await StableBeamRunsRepository.getWeeklyDataSize(period))
            .map(({ year, week, size }) => ({
                year,
                week,
                // Sequelize is not constant with BigInt, force them to string
                size: `${size}`,
            }));
    }

    /**
     * Return the time between runs histogram (15 minutes window)
     *
     * @param {Period} period the period of statistics to query
     * @return {Promise<Histogram>} the resulting histogram
     */
    async getTimeBetweenRunsDistribution(period) {
        const timeWindow = 5;
        const restWindow = 30;

        const bins = (await StableBeamRunsRepository.getTimeBetweenRunsDistribution(period, timeWindow, restWindow))
            .map(({ offset, count }) => ({ offset, count }));

        return {
            bins,
            min: bins[0]?.offset ?? 0,
            max: bins.length > 0
                ? bins[bins.length - 1].offset + 1
                : 0,
        };
    }
}

exports.StatisticsService = StatisticsService;

exports.statisticsService = new StatisticsService();
