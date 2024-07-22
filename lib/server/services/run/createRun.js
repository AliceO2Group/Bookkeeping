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
const { RunDetectorQualities } = require('../../../domain/enums/RunDetectorQualities.js');
const { getLhcFill } = require('../lhcFill/getLhcFill.js');
const { getRunDefinition, RunDefinition } = require('./getRunDefinition.js');
const { getRunType } = require('../runType/getRunType.js');
const { DEFAULT_RUN_CALIBRATION_STATUS } = require('../../../domain/enums/RunCalibrationStatus.js');
const { BadParameterError } = require('../../errors/BadParameterError.js');

/**
 * Create a run in the database and return the auto generated id
 *
 * @param {Partial<SequelizeRun>} newRun the run to create
 * @param {object} relations the entities related to the run
 * @param {SequelizeDetector[]|null} [relations.detectors=null] if not null, creates the detectors applied to the run
 * @param {SequelizeLhcFill|null} [relations.lhcFill=null] if not null, link this fill to the run (overrides the fillNumber property of newRun)
 * @param {SequelizeRunType|null} [relations.runType=null] if not null, link this run type to the run (overrides the runTypeId property of
 *     newRun)
 * @return {Promise<number>} resolve once the creation is done providing the id of the run that have been (or will be) created
 */
exports.createRun = async (newRun, relations) => {
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

    if (newRun.definition === RunDefinition.Calibration && !newRun.calibrationStatus) {
        newRun.calibrationStatus = DEFAULT_RUN_CALIBRATION_STATUS;
    }

    if (newRun.definition !== RunDefinition.Calibration && newRun.calibrationStatus) {
        throw new BadParameterError('Calibration status is reserved to calibration runs');
    }

    if (detectors) {
        await RunDetectorsRepository.insertMany(detectors.map((detector) => ({
            runNumber,
            detectorId: detector.id,
            quality: RunDetectorQualities.GOOD,
        })));
    }
    const { id } = await RunRepository.insert(newRun);
    return id;
};
