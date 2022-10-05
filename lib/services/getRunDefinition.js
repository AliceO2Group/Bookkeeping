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
        detectors,
        lhcFill,
        timeO2Start, timeTrgStart, timeTrgEnd, timeO2End,
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
        const runStartString = timeTrgStart ?? timeO2Start;
        const runStart = runStartString ? new Date(runStartString) : null;
        const runEndString = timeTrgEnd ?? timeO2End;
        const runEnd = runEndString ? new Date(runEndString) : new Date();
        const { stableBeamsStart: stableBeamStartString, stableBeamsEnd: stableBeamEndString } = lhcFill ?? {};
        const stableBeamStart = stableBeamStartString ? new Date(stableBeamStartString) : null;
        const stableBeamEnd = new Date(stableBeamEndString ?? null);

        const stableBeamOverlap = stableBeamStart && runStart && stableBeamEnd >= runStart && runEnd >= stableBeamStart;
        // Physics or cosmics
        if ((detectors && detectors?.includes('ITS') || detectors?.includes('FT0')) && stableBeamOverlap) {
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
