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

const { gaqDetectorAdapter, detectorAdapter } = require('../../../database/adapters');
const { GaqDetectorRepository, RunRepository, DetectorRepository } = require('../../../database/repositories');
const { BadParameterError } = require('../../errors/BadParameterError');
const { dataSource } = require('../../../database/DataSource.js');
const { Op } = require('sequelize');
const { getOneDataPassOrFail } = require('../dataPasses/getOneDataPassOrFail');

/**
 * List of default GAQ detectors for pp runs
 */
const DEFAULT_GAQ_DETECTORS_FOR_PROTON_PROTON_RUNS = ['TPC', 'ITS', 'FT0'];

/**
 * List of default GAQ detectors for PbPb runs
 */
const DEFAULT_GAQ_DETECTORS_FOR_LEAD_LEAD_RUNS = ['TPC', 'ITS', 'FT0', 'ZDC'];

/**
 * GaqDetectorService
 */
class GaqDetectorService {
    /**
     * Set list of detectors which flags contribute to GAQ (global aggregated quality)
     * for given runs and data pass
     *
     * @param {number} dataPassId data pass id
     * @param {number[]} runNumbers list of run numbers
     * @param {number[]} detectorIds list of ids of detectors included in GAQ computation for the given runs and data pass
     * @return {Promise<void>} promise resolved once association between data pass, runs and detectors was set
     */
    setGaqDetectors(dataPassId, runNumbers, detectorIds) {
        return dataSource.transaction(async () => {
            await getOneDataPassOrFail({ id: dataPassId });
            await this._verifyDataPassAndRunsAssociation(dataPassId, runNumbers);
            await this._verifyRunsAndDplDetectorsAssociations(runNumbers, detectorIds);

            await GaqDetectorRepository.removeAll({
                where: {
                    dataPassId,
                    runNumber: { [Op.in]: runNumbers },
                },
            });
            const gaqEntries = runNumbers
                .flatMap((runNumber) => detectorIds
                    .map((detectorId) => ({ dataPassId, runNumber, detectorId })));
            const createdEntries = await GaqDetectorRepository.insertAll(gaqEntries);
            return createdEntries.map(gaqDetectorAdapter.toEntity);
        });
    }

    /**
     * Set default list of detectors which flags contribute to GAQ (global aggregated quality) for given runs and data pass
     * Where, for given run, default list of GAQ detectors is intersection of detectors linked to it with list of detectors
     *  from @see DEFAULT_GAQ_DETECTORS_FOR_PDP_BEAM_TYPE, which depends on beam type of the run
     *
     * @param {number} dataPassId data pass id
     * @param {number[]} runNumbers list of run numbers
     * @param {object} [options] additional options
     * @param {sequelize.Transaction} [options.transaction] sequelize transaction
     * @return {Promise<void>} promise resolved once association between data pass, runs and detectors was set
     */
    useDefaultGaqDetectors(dataPassId, runNumbers, { transaction } = {}) {
        return dataSource.transaction(async () => {
            await getOneDataPassOrFail({ id: dataPassId });
            await this._verifyDataPassAndRunsAssociation(dataPassId, runNumbers);

            await GaqDetectorRepository.removeAll({
                where: {
                    dataPassId,
                    runNumber: { [Op.in]: runNumbers },
                },
            });

            const runsWithDetectors = await RunRepository.findAll({
                where: { runNumber: { [Op.in]: runNumbers } },
                include: [
                    {
                        association: 'detectors',
                        where: { [Op.or]: [
                            { '$Run.pdp_beam_type$': 'pp', name: { [Op.in]: DEFAULT_GAQ_DETECTORS_FOR_PROTON_PROTON_RUNS } },
                            { '$Run.pdp_beam_type$': 'PbPb', name: { [Op.in]: DEFAULT_GAQ_DETECTORS_FOR_LEAD_LEAD_RUNS } },
                        ] },
                    },
                ],
            });

            const gaqEntries = runsWithDetectors
                .flatMap(({ runNumber, detectors }) => detectors
                    .map(({ id: detectorId }) => ({ dataPassId, runNumber, detectorId })));
            const createdEntries = await GaqDetectorRepository.insertAll(gaqEntries);
            return createdEntries.map(gaqDetectorAdapter.toEntity);
        }, { transaction });
    }

    /**
     * Find detectors which flags contribute to GAQ for given run and data pass
     *
     * @param {number} dataPassId id of data pass
     * @param {number} runNumber run number
     * @return {Promise<Partial<Detector>[]>} promise of detectors
     */
    async getGaqDetectors(dataPassId, runNumber) {
        const queryBuilder = dataSource.createQueryBuilder()
            .where('dataPassId').is(dataPassId)
            .where('runNumber').is(runNumber)
            .include({ association: 'detector' })
            .orderBy((sequelize) => sequelize.col('`detector`.name'), 'ASC');

        const gaqDetectors = await GaqDetectorRepository.findAll(queryBuilder);
        return gaqDetectors.map(({ detector }) => detectorAdapter.toMinifiedEntity(detector));
    }

    /**
     * Verify associations between data pass and runs exist
     *
     * @param {number} dataPassId id of a data pass
     * @param {number[]} runNumbers list of run numbers
     * @return {Promise<void>} promise resolved once associations are validated
     * @throws {BadParameterError} if some association does not exist
     */
    async _verifyDataPassAndRunsAssociation(dataPassId, runNumbers) {
        const validRunNumbers = await RunRepository.findAll({
            attributes: ['runNumber'],
            where: { runNumber: { [Op.in]: runNumbers } },
            include: [{ association: 'dataPass', where: { id: dataPassId }, required: true }],
        });
        const validRunNumbersSet = new Set(validRunNumbers.map(({ runNumber }) => runNumber));
        const invalidRunNumbers = runNumbers.filter((runNumber) => !validRunNumbersSet.has(runNumber));
        if (invalidRunNumbers.length > 0) {
            const errorMessage = `No association between data pass with id ${dataPassId} and following runs: ${invalidRunNumbers}`;
            throw new BadParameterError(errorMessage);
        }
    }

    /**
     * Verify that all the given runs includes each of the given detectors
     * As there is no direct link between runs and detectors,
     *  association between run and corresponding Detector (with same name as detector) is checked
     *
     * @param {number[]} runNumbers list of run numbers
     * @param {number[]} detectorIds list of IDs of detectors
     * @return {Promise<void>} promise resolved once associations are validated
     * @throws {BadParameterError} if some association does not exist
     */
    async _verifyRunsAndDplDetectorsAssociations(runNumbers, detectorIds) {
        const detectors = await DetectorRepository.findAll({
            attributes: ['id', 'name'],
            where: { id: { [Op.in]: detectorIds } },
        });
        const validDetectorIdsSet = new Set(detectors.map(({ id }) => id));
        const invalidIds = detectorIds.filter((detectorId) => !validDetectorIdsSet.has(detectorId));
        if (invalidIds.length > 0) {
            throw new BadParameterError(`No detectors with IDs: (${invalidIds})`);
        }
        const validDetectorNames = detectors.map(({ name }) => name);

        const runAndDetector = (await RunRepository.findAll({
            attributes: ['runNumber'],
            where: { runNumber: { [Op.in]: runNumbers } },
            include: [
                {
                    association: 'detectors',
                    attributes: ['name'],
                    where: { id: { [Op.in]: detectorIds } },
                    through: { attributes: [] },
                    required: false,
                },
            ],
        })).map(({ runNumber, detectors }) => [runNumber, detectors.map(({ name }) => name)]);

        const validRunToDetectors = Object.fromEntries(runAndDetector);

        const missingRunDetectorAssociations = runNumbers
            .map((runNumber) => [
                runNumber,
                validDetectorNames.filter((detectorName) => !validRunToDetectors[runNumber]?.includes(detectorName)),
            ])
            .filter(([_, missingDetectors]) => missingDetectors.length > 0);

        if (missingRunDetectorAssociations.length > 0) {
            const errorMessage = `No association between runs and detectors: ${JSON.stringify(missingRunDetectorAssociations)}`;
            throw new BadParameterError(errorMessage);
        }
    }
}

module.exports = {
    GaqDetectorService,
    gaqDetectorService: new GaqDetectorService,
    DEFAULT_GAQ_DETECTORS_FOR_PROTON_PROTON_RUNS,
    DEFAULT_GAQ_DETECTORS_FOR_LEAD_LEAD_RUNS,
};
