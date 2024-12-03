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
const { models: { QcFlag } } = require('..');
const Repository = require('./Repository');

/**
 * @typedef GaqPeriod
 *
 * @property {number} dataPassId
 * @property {number} runNumber
 * @property {number} from
 * @property {number} to
 * @property {number[]} contributingFlagIds IDs of QC flags which together define global aggregated quality in the period [from, to]
 */

/**
 * @typedef RunGaqSubSummary aggregation of QC flags information by QcFlagType property `bad`
 *
 * @property {number} runNumber
 * @property {number} bad
 * @property {number} effectiveRunCoverage
 * @property {number[]} flagsIds
 * @property {number[]} verifiedFlagsIds
 * @property {number} mcReproducible
 */

/**
 * Sequelize implementation of the QcFlagRepository
 */
class QcFlagRepository extends Repository {
    /**
     * Creates a new `QcFlagRepository` instance.
     */
    constructor() {
        super(QcFlag);
    }

    /**
     * Find GAQ periods for given data pass and run
     *
     * @param {number} dataPassId id of data pass id
     * @param {number} runNumber run number
     * @return {Promise<GaqPeriod[]>} Resolves with the GAQ periods
     */
    async findGaqPeriods(dataPassId, runNumber) {
        const query = `
            SELECT * FROM gaq_periods
            WHERE IF(gaq_periods.\`to\` = UNIX_TIMESTAMP(NOW()), null, gaq_periods.\`to\`) IS NOT NULL
                AND gaq_periods.dataPassId = ${dataPassId}
                ${runNumber ? `AND gaq_periods.runNumber = ${runNumber}` : ''}
            `;

        const [rows] = await this.model.sequelize.query(query);
        return rows.map(({
            dataPassId,
            runNumber,
            from,
            to,
            flagsList,
        }) => ({
            dataPassId,
            runNumber,
            from: from * 1000, // Change unix seconds to miliseconds
            to: to * 1000,
            contributingFlagIds: flagsList ? flagsList.split(',').map((id) => parseInt(id, 10)) : [],
        })).filter(({ contributingFlagIds }) => contributingFlagIds.length > 0);
    }

    /**
     * Get GAQ sub-summaries for given data pass
     *
     * @param {number} dataPassId id of data pass id
     * @param {object} [options] additional options
     * @param {boolean} [options.mcReproducibleAsNotBad = false] if set to true,
     * `Limited Acceptance MC Reproducible` flag type is treated as good one
     * @return {Promise<RunGaqSubSummary[]>} Resolves with the GAQ sub-summaries
     */
    async getRunGaqSubSummaries(dataPassId, { mcReproducibleAsNotBad = false } = {}) {
        const query = `
            SELECT
                effectivePeriods.runNumber,
                effectivePeriods.dataPassId,
                effectivePeriods.bad,
                effectivePeriods.badWhenMcReproducibleAsNotBad,
                SUM(effectivePeriods.mcReproducible) > 0 AS mcReproducible,
                GROUP_CONCAT(effectivePeriods.verifiedFlagsList) AS verifiedFlagsList,
                GROUP_CONCAT(effectivePeriods.flagsList) AS flagsList,

                IF(
                    (
                        run.time_end   IS NULL
                     OR run.time_start IS NULL
                    ),
                    IF(
                        SUM(
                            COALESCE(effectivePeriods.\`to\`  , 0)
                          + COALESCE(effectivePeriods.\`from\`, 0)
                        ) = 0,
                        1,
                        null
                    ),
                    SUM(
                        COALESCE(
                            effectivePeriods.\`to\`,
                            UNIX_TIMESTAMP(run.time_end)
                        )
                      - COALESCE(
                            effectivePeriods.\`from\`,
                            UNIX_TIMESTAMP(run.time_start)
                        )
                    ) / (
                        UNIX_TIMESTAMP(run.time_end)
                      - UNIX_TIMESTAMP(run.time_start)
                    )
                ) AS effectiveRunCoverage

            FROM gaq_periods AS effectivePeriods
            INNER JOIN runs AS run ON run.run_number = effectivePeriods.runNumber

            WHERE effectivePeriods.dataPassId = :dataPassId

            GROUP BY
                effectivePeriods.dataPassId,
                effectivePeriods.runNumber,
                effectivePeriods.bad
        `;

        const [rows] = await this.model.sequelize.query(query, { replacements: { dataPassId } });
        return rows.map(({
            runNumber,
            bad,
            badWhenMcReproducibleAsNotBad,
            effectiveRunCoverage,
            mcReproducible,
            flagsList,
            verifiedFlagsList,
        }) => ({
            runNumber,
            bad: mcReproducibleAsNotBad ? badWhenMcReproducibleAsNotBad : bad,
            effectiveRunCoverage: parseFloat(effectiveRunCoverage) || null,
            mcReproducible: Boolean(mcReproducible),
            flagsIds: flagsList ? [...new Set(flagsList.split(','))] : [],
            verifiedFlagsIds: verifiedFlagsList ? [...new Set(verifiedFlagsList.split(','))] : [],
        })).filter(({ bad }) => bad !== null);
    }

    /**
     * Find all QC flags created before and after given one for the same run, detector, data/simulation pass.
     * Flags are sorted by createdAt property in ascending manner
     * @param {number} id id of QC flag
     * @return {Promise<{ after: SequelizeQcFlag[], before: SequelizeQcFlag[] }>} QC flags created before and after given one
     */
    async findFlagsCreatedAfterAndBeforeGivenOne(id) {
        const qcFlag = await this.findOne({
            where: { id },
            include: [{ association: 'dataPasses' }, { association: 'simulationPasses' }],
        });

        const { runNumber, detectorId, createdAt } = qcFlag;
        const dataPasses = qcFlag.get('dataPasses');
        const simulationPasses = qcFlag.get('simulationPasses');

        const dataPassId = dataPasses[0]?.id;
        const simulationPassId = simulationPasses[0]?.id;

        const flagIncludes = [];
        let synchronousQcWhereClause = {};

        // QC flag can be associated with only one data pass or only one simulation pass or be synchronous
        if (dataPassId !== undefined) {
            flagIncludes.push({ association: 'dataPasses', where: { id: dataPassId }, required: true });
        } else if (simulationPassId !== undefined) {
            flagIncludes.push({ association: 'simulationPasses', where: { id: simulationPassId }, required: true });
        } else {
            flagIncludes.push({ association: 'dataPasses', required: false });
            flagIncludes.push({ association: 'simulationPasses', required: false });
            synchronousQcWhereClause = { '$dataPasses.id$': null, '$simulationPasses.id$': null };
        }

        const flagsCreatedAfterRemovedFlag = await this.findAll({
            where: {
                detectorId,
                runNumber,
                createdAt: { [Op.gt]: createdAt },
                ...synchronousQcWhereClause,
            },
            include: flagIncludes,
            sort: [['createdAt', 'ASC']],
        });

        const flagsCreatedBeforeRemovedFlag = await this.findAll({
            where: {
                id: { [Op.not]: id },
                detectorId,
                runNumber,
                createdAt: { [Op.lte]: createdAt },
                ...synchronousQcWhereClause,
            },
            include: flagIncludes,
            sort: [['createdAt', 'ASC']],
        });

        return {
            before: flagsCreatedBeforeRemovedFlag,
            after: flagsCreatedAfterRemovedFlag,
        };
    }
}

module.exports = new QcFlagRepository();
