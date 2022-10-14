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
    Cosmic: 'COSMIC',
    Technical: 'TECHNICAL',
    Synthetic: 'SYNTHETIC',
    Calibration: 'CALIBRATION',
};

const COSMIC_OR_PHYSICS_TF_BUILDER_MODE = ['processing', 'processing-disk'];

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
    } = run;

    // Check for physics or cosmic first, then look for other definitions
    if (
        dcs && dd_flp && epn
        && triggerValue === 'CTP'
        && COSMIC_OR_PHYSICS_TF_BUILDER_MODE.includes(tfbDdMode)
        && pdpWorkflowParameters?.includes('CTF')
    ) {
        const { stableBeamsStart: stableBeamStartString, stableBeamsEnd: stableBeamEndString } = lhcFill ?? {};
        const stableBeamStart = stableBeamStartString ? new Date(stableBeamStartString).getTime() : null;
        const stableBeamEnd = (stableBeamEndString ? new Date(stableBeamEndString) : new Date()).getTime();

        const stableBeamOverlap = stableBeamStart !== null && startTime && stableBeamEnd >= startTime && endTime >= stableBeamStart;
        // Physics or cosmics
        if ((concatenatedDetectors && concatenatedDetectors?.includes('ITS') || concatenatedDetectors?.includes('FT0')) && stableBeamOverlap) {
            return RunDefinition.Physics;
        } else if (runType?.name.match(/^cosmics?$/i)) {
            return RunDefinition.Cosmic;
        }
    }

    let definition = null;

    if (runType?.name?.toUpperCase() === 'TECHNICAL' && pdpBeamType === 'technical') {
        definition = RunDefinition.Technical;
    } else if (
        !dcs
        && triggerValue === 'OFF'
        && readoutCfgUri?.match(/^file:\/\/\/.*replay.*\/cfg$/)
        && readoutCfgUri?.match(/^file:\/\/\/.*(pp|pbpb).*\/cfg$/)
        && !pdpWorkflowParameters?.includes('CTF')
    ) {
        definition = RunDefinition.Synthetic;
    } else if (runType?.name?.toUpperCase().startsWith('CALIBRATION_')) {
        definition = RunDefinition.Calibration;
    }

    return definition;
};

module.exports = {
    getRunDefinition,
    RunDefinition,
    COSMIC_OR_PHYSICS_TF_BUILDER_MODE,
};
