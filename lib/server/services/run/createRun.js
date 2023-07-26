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
 * or submit itself to any jusdiction.
 */

const { getRun } = require('./getRun.js');
const { ConflictError } = require('../../errors/ConflictError.js');
const RunRepository = require('../../../database/repositories/RunRepository.js');
const RunDetectorsRepository = require('../../../database/repositories/RunDetectorsRepository.js');
const { utilities: { TransactionHelper } } = require('../../../database');
const { RunDetectorQualities } = require('../../../domain/enums/RunDetectorQualities.js');
const { getLhcFill } = require('../lhcFill/getLhcFill.js');
const { getRunDefinition } = require('./getRunDefinition.js');
const { getRunType } = require('../runType/getRunType.js');

/**
 * Create a run in the database and return the auto generated id
 *
 * @param {Partial<SequelizeRun>} newRun the run to create
 * @param {object} relations the entities related to the run
 * @param {SequelizeDetector[]|null} [relations.detectors=null] if not null, creates the detectors applied to the run
 * @param {SequelizeLhcFill|null} [relations.lhcFill=null] if not null, link this fill to the run (overrides the fillNumber property of newRun)
 * @param {SequelizeRunType|null} [relations.runType=null] if not null, link this run type to the run (overrides the runTypeId property of
 *     newRun)
 * @param {Object} [transaction] optionally the transaction in which one the log creation is executed
 * @return {Promise<number>} resolve once the creation is done providing the id of the run that have been (or will be) created
 */
exports.createRun = async (newRun, relations, transaction) => {
    const { detectors = null } = relations || {};
    let { lhcFill = null, runType = null } = relations || {};

    const { runNumber, id: runId } = newRun;
    if (runNumber || runId) {
        const existingRun = await getRun({ runNumber, runId });
        if (existingRun) {
            throw new ConflictError(`A run already exists with ${runNumber ? 'run number' : 'id'} ${runNumber ?? runId}`);
        }
    }

    if (lhcFill?.fillNumber) {
        newRun.fillNumber = lhcFill.fillNumber;
    } else if (newRun.fillNumber) {
        lhcFill = await getLhcFill(newRun.fillNumber);
    }

    if (runType?.id) {
        newRun.runTypeId = runType.id;
    } else if (newRun.runTypeId) {
        runType = await getRunType({ id: newRun.runTypeId });
    }

    newRun.definition = getRunDefinition({
        ...newRun,
        runType,
        lhcFill,
    });

    if (detectors) {
        await TransactionHelper.provide(async () => RunDetectorsRepository.insertMany(detectors.map((detector) => ({
            runNumber,
            detectorId: detector.id,
            quality: RunDetectorQualities.GOOD,
        }))), { transaction });
    }
    const { id } = await TransactionHelper.provide(async () => RunRepository.insert(newRun), { transaction });
    return id;
};
