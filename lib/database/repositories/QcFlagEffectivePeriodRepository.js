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
const { models: { QcFlagEffectivePeriod } } = require('..');
const Repository = require('./Repository');

/**
 * Sequelize implementation of the QcFlagEffectivePeriodRepository
 */
class QcFlagEffectivePeriodRepository extends Repository {
    /**
     * Creates a new `QcFlagEffectivePeriodRepository` instance.
     */
    constructor() {
        super(QcFlagEffectivePeriod);
    }

    /**
     * Find all effective periods overlapping with given period and created for QC flags
     * in given scope which were created not after given timestamp
     *
     * @param {Period} period period which effective periods must overlap with
     * @param {number|Date} createdAtUpperLimit upper limit of QC flags creation timestamp which effective periods are to be found
     * @param {object} monalisaProduction the scope of the flag
     * @param {number} [monalisaProduction.dataPassId] id of data pass, which the QC flag belongs to
     * @param {number} [monalisaProduction.simulationPassId] id of simulation pass, which the QC flags belongs to
     * @param {number} monalisaProduction.runNumber runNumber of run, which the QC flags belongs to
     * @param {number} monalisaProduction.detectorId id of DPL detector, which the QC flags belongs to
     * @return {Promise<SequelizeQcFlagEffectivePeriod[]>} effective periods promise
     */
    async findOverlappingPeriodsCreatedBeforeLimit(period, createdAtUpperLimit, { dataPassId, simulationPassId, runNumber, detectorId }) {
        const { to, from } = period;

        const flagIncludes = [];
        let synchronousQcWhereClause = {};

        // QC flag can be associated with only one data pass or only one simulation pass or be synchronous
        if (dataPassId !== null && dataPassId !== undefined) {
            flagIncludes.push({ association: 'dataPasses', where: { id: dataPassId }, required: true });
        } else if (simulationPassId !== null && simulationPassId !== undefined) {
            flagIncludes.push({ association: 'simulationPasses', where: { id: simulationPassId }, required: true });
        } else {
            flagIncludes.push({ association: 'dataPasses', required: false });
            flagIncludes.push({ association: 'simulationPasses', required: false });
            synchronousQcWhereClause = { '$flag->dataPasses.id$': null, '$flag->simulationPasses.id$': null };
        }

        const periodsIntersectionWhereClause = [];
        if (to) {
            periodsIntersectionWhereClause.push({
                [Op.or]: [
                    { from: null },
                    { from: { [Op.lt]: to } },
                ],
            });
        }
        if (from) {
            periodsIntersectionWhereClause.push({
                [Op.or]: [
                    { to: null },
                    { to: { [Op.gt]: from } },
                ],
            });
        }

        return this.findAll({
            subQuery: false,
            where: {
                [Op.and]: [
                    ...periodsIntersectionWhereClause,
                    synchronousQcWhereClause,
                ],
            },
            include: [
                {
                    association: 'flag',
                    include: flagIncludes,
                    where: {
                        [Op.and]: [
                            { detectorId, runNumber },
                            { createdAt: { [Op.lte]: createdAtUpperLimit } },
                        ],
                    },
                },
            ],
        });
    }
}

module.exports = new QcFlagEffectivePeriodRepository();
