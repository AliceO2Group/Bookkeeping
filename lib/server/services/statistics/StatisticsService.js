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
const { LhcFillStatisticsRepository, StableBeamRunsRepository, LogRepository } = require('../../../database/repositories/index.js');
const { lhcFillStatisticsAdapter } = require('../../../database/adapters/index.js');
const { Op } = require('sequelize');

/**
 * @typedef DetectorsEfficienciesPerFill
 * @property {number} fillNumber the fill number on which detector efficiencies are computed
 * @property {Object<string, number>} efficiencies the list of detector efficiencies indexed by the detector name
 * @property {Object<string, number>} netEfficiencies the list of net detector efficiencies indexed by the detector name
 */

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

    /**
     * Return the list of efficiency for every detector (grouped per fill) for the given period
     *
     * @param {Period} period the period on which data must be fetched
     * @return {Promise<DetectorsEfficienciesPerFill[]>} the efficiency per detector
     */
    async getDetectorsEfficienciesPerFill(period) {
        const efficiencyRows = await StableBeamRunsRepository.getEfficienciesPerFillPerDetector(period);

        if (efficiencyRows.length === 0) {
            return [];
        }

        /**
         * @type {DetectorsEfficienciesPerFill[]}
         */
        const detectorEfficienciesPerFill = [];

        /**
         * @type {DetectorsEfficienciesPerFill}
         */
        let currentItem = { fillNumber: efficiencyRows[0].fillNumber, efficiencies: {}, netEfficiencies: {} };

        for (const efficiencyRow of efficiencyRows) {
            const { fillNumber, detectorName, efficiency, netEfficiency } = efficiencyRow;
            if (fillNumber !== currentItem.fillNumber) {
                detectorEfficienciesPerFill.push(currentItem);
                currentItem = { fillNumber, efficiencies: {}, netEfficiencies: {} };
            }
            currentItem.efficiencies[detectorName] = parseFloat(efficiency);
            currentItem.netEfficiencies[detectorName] = parseFloat(netEfficiency);
        }

        detectorEfficienciesPerFill.push(currentItem);

        return detectorEfficienciesPerFill;
    }

    /**
     * Return the list of tags and their occurrences in logs created in the given period
     *
     * @param {Period} period the period of statistics to query
     * @return {Promise<{tag: string, count: string}>} the resulting histogram
     */
    async getTagsOccurrencesInLogs(period) {
        return LogRepository.getTagDistribution(period);
    }
}

exports.StatisticsService = StatisticsService;

exports.statisticsService = new StatisticsService();
