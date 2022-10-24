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

const RunDefinition = {
    Physics: 'PHYSICS',
    Cosmics: 'COSMICS',
    Technical: 'TECHNICAL',
    Synthetic: 'SYNTHETIC',
    Calibration: 'CALIBRATION',
    Commissioning: 'COMMISSIONING',
};

const COSMICS_OR_PHYSICS_TF_BUILDER_MODE = ['processing', 'processing-disk'];

const CALIBRATION_RUN_TYPES_STARTS_WITH = ['CALIBRATION_', 'PEDESTAL', 'LASER', 'PULSER'];

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
        startTime, endTime,
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

        const stableBeamOverlap = stableBeamStart !== null && startTime && stableBeamEnd >= startTime && endTime >= stableBeamStart;
        // Physics or cosmics
        if ((concatenatedDetectors && concatenatedDetectors?.includes('ITS') || concatenatedDetectors?.includes('FT0')) && stableBeamOverlap) {
            return RunDefinition.Physics;
        } else if (runType?.name.match(/^cosmics?$/i) && lhcBeamMode === 'NO BEAM') {
            return RunDefinition.Cosmics;
        }
    }

    let definition = RunDefinition.Commissioning;

    if (runType?.name?.toUpperCase() === 'TECHNICAL' && pdpBeamType === 'technical') {
        definition = RunDefinition.Technical;
    } else if (
        !dcs
        && triggerValue === 'OFF'
        && readoutCfgUri?.includes('replay')
        && readoutCfgUri?.match('pp|pbpb')
    ) {
        definition = RunDefinition.Synthetic;
    } else if (CALIBRATION_RUN_TYPES_STARTS_WITH.some((prefix) => runType?.name?.toUpperCase().startsWith(prefix))) {
        definition = RunDefinition.Calibration;
    }

    return definition;
};

module.exports = {
    getRunDefinition,
    RunDefinition,
    COSMICS_OR_PHYSICS_TF_BUILDER_MODE,
    CALIBRATION_RUN_TYPES_STARTS_WITH: CALIBRATION_RUN_TYPES_STARTS_WITH,
};
