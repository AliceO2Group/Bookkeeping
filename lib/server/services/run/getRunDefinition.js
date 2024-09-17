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
const { RunDefinition } = require('../../../domain/enums/RunDefinition.js');

const COSMICS_OR_PHYSICS_TF_BUILDER_MODE = ['processing', 'processing-disk'];

const CALIBRATION_RUN_TYPES_STARTS_WITH = ['CALIBRATION_', 'PEDESTAL', 'LASER', 'PULSER', 'NOISE'];

/**
 * Returns the definition of a given run
 *
 * @param {SequelizeRun} run the run for which definition must be extracted
 * @return {null|string} the run type
 */
const getRunDefinition = (run) => {
    const {
        concatenatedDetectors,
        lhcFill,
        timeTrgStart,
        timeO2Start,
        timeTrgEnd,
        timeO2End,
        triggerValue,
        dcs, dd_flp, epn,
        tfbDdMode,
        pdpWorkflowParameters,
        runType,
        pdpBeamType,
        readoutCfgUri,
        lhcBeamMode,
    } = run;

    // Check for physics or cosmics first, then look for other definitions
    if (
        dcs && dd_flp && epn
        && triggerValue === 'CTP'
        && COSMICS_OR_PHYSICS_TF_BUILDER_MODE.includes(tfbDdMode)
        && pdpWorkflowParameters?.includes('CTF')
    ) {
        const { stableBeamsStart: stableBeamStartString, stableBeamsEnd: stableBeamEndString } = lhcFill ?? {};
        const stableBeamStart = stableBeamStartString ? new Date(stableBeamStartString).getTime() : null;
        const stableBeamEnd = (stableBeamEndString ? new Date(stableBeamEndString) : new Date()).getTime();

        // eslint-disable-next-line require-jsdoc
        const parseDate = (toParse) => {
            if (!(toParse instanceof Date)) {
                return new Date(toParse).getTime();
            }
            return toParse.getTime();
        };

        const startTime = parseDate(timeTrgStart ?? timeO2Start);
        const endTime = parseDate(timeTrgEnd ?? timeO2End ?? new Date());

        const stableBeamOverlap = stableBeamStart !== null && startTime && stableBeamEnd >= startTime && endTime >= stableBeamStart;

        // Physics or Cosmics
        if (concatenatedDetectors && concatenatedDetectors?.includes('ITS') && concatenatedDetectors?.includes('FT0') && stableBeamOverlap) {
            return RunDefinition.PHYSICS;
        } else if (runType?.name?.match(/^cosmics?$/i) && (!lhcBeamMode || lhcBeamMode === 'NO BEAM')) {
            return RunDefinition.COSMICS;
        }
    }

    let definition = RunDefinition.COMMISSIONING;

    if (runType?.name?.toUpperCase() === 'TECHNICAL' && pdpBeamType === 'technical') {
        definition = RunDefinition.TECHNICAL;
    } else if (
        !dcs
        && triggerValue === 'OFF'
        && readoutCfgUri?.includes('replay')
        && readoutCfgUri?.match('pp|pbpb')
    ) {
        definition = RunDefinition.SYNTHETIC;
    } else if (CALIBRATION_RUN_TYPES_STARTS_WITH.some((prefix) => runType?.name?.toUpperCase().startsWith(prefix))) {
        definition = RunDefinition.CALIBRATION;
    }

    return definition;
};

module.exports = {
    getRunDefinition,
    COSMICS_OR_PHYSICS_TF_BUILDER_MODE,
    CALIBRATION_RUN_TYPES_STARTS_WITH: CALIBRATION_RUN_TYPES_STARTS_WITH,
};
