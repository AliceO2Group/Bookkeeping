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
const { GaqDetectorRepository, RunRepository, DplDetectorRepository } = require('../../../database/repositories');
const { BadParameterError } = require('../../errors/BadParameterError');
const { dataSource } = require('../../../database/DataSource.js');
const { Op } = require('sequelize');
const { getOneDataPassOrFail } = require('../dataPasses/getOneDataPassOrFail');

/**
 * Lists of default GAQ detectors for runs with given pdp_beam_type
 */
const DEFAULT_GAQ_DETECTORS_FOR_PDP_BEAM_TYPE = {
    pp: ['TPC', 'ITS', 'FT0'],
    PbPb: ['TPC', 'ITS', 'FT0', 'ZDC'],
};

/**
 * GaqDetectorService
 */
class GaqDetectorService {
    /**
     * Set list of DPL detectors which flags contribute to GAQ (global aggregated quality)
     * for given runs and data pass
     *
     * @param {number} dataPassId data pass id
     * @param {number[]} runNumbers list of run numbers
     * @param {number[]} detectorIds list of ids of DPL detectors included in GAQ computation for the given runs and data pass
     * @return {Promise<void>} promise resolved once association between data pass, runs and detectors was set
     */
    async setGaqDetectors(dataPassId, runNumbers, detectorIds) {
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
     * Set default list of DPL detectors which flags contribute to GAQ (global aggregated quality) for given runs and data pass
     * Where, for given run, default list of GAQ detectors is intersection of detectors linked to it with list of detectors
     *  from @see DEFAULT_GAQ_DETECTORS_FOR_PDP_BEAM_TYPE, which depends on beam type of the run
     *
     * @param {number} dataPassId data pass id
     * @param {number[]} runNumbers list of run numbers
     * @return {Promise<void>} promise resolved once association between data pass, runs and detectors was set
     */
    async setDefaultGaqDetectors(dataPassId, runNumbers, { transaction }) {
        return dataSource.transaction(async () => {
            await getOneDataPassOrFail({ id: dataPassId });
            await this._verifyDataPassAndRunsAssociation(dataPassId, runNumbers);

            await GaqDetectorRepository.removeAll({
                where: {
                    dataPassId,
                    runNumber: { [Op.in]: runNumbers },
                },
            });

            const pdpBeamTypeDependentWhereClauses = Object.entries(DEFAULT_GAQ_DETECTORS_FOR_PDP_BEAM_TYPE)
                .map(([pdpBeamType, detectorNames]) => ({ '$Run.pdp_beam_type$': pdpBeamType, name: { [Op.in]: detectorNames } }));

            const runsWithDetectors = await RunRepository.findAll({
                where: { runNumber: { [Op.in]: runNumbers } },
                include: [
                    {
                        association: 'detectors',
                        where: { [Op.or]: pdpBeamTypeDependentWhereClauses },
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
     * Find DPL detectors which flags contribute to GAQ for given run and data pass
     *
     * @param {number} dataPassId id of data pass
     * @param {number} runNumber run number
     * @return {Promise<Partial<DplDetector>[]>} promise of DPL detectors
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
     * As there is no direct link between runs and DPL detectors,
     *  association between run and corresponding Detector (with same name as DPL Detector) is checked
     *
     * @param {number[]} runNumbers list of run numbers
     * @param {number[]} detectorIds list of IDs of DPL detectors
     * @return {Promise<void>} promise resolved once associations are validated
     * @throws {BadParameterError} if some association does not exist
     */
    async _verifyRunsAndDplDetectorsAssociations(runNumbers, detectorIds) {
        const dplDetectors = await DplDetectorRepository.findAll({
            attributes: ['id', 'name'],
            where: { id: { [Op.in]: detectorIds } },
        });
        const validDetectorIdsSet = new Set(dplDetectors.map(({ id }) => id));
        const invalidIds = detectorIds.filter((detectorId) => !validDetectorIdsSet.has(detectorId));
        if (invalidIds.length > 0) {
            throw new BadParameterError(`No DPL detectors with IDs: (${invalidIds})`);
        }
        const validDetectorNames = dplDetectors.map(({ name }) => name);

        const runAndDetector = (await RunRepository.findAll({
            attributes: ['runNumber'],
            where: { runNumber: { [Op.in]: runNumbers } },
            include: [
                {
                    association: 'detectors',
                    attributes: ['name'],
                    where: { name: { [Op.in]: validDetectorNames } },
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
};
