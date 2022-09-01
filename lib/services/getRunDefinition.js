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
};

const COSMIC_OR_PHYSICS_TF_BUILDER_MODE = ['processing', 'processing-disk'];

/**
 * Returns the definition of a given run
 *
 * @param {Run} run the run for which definition must be extracted
 * @return {null|string} the run type
 */
const getRunDefinition = (run) => {
    const {
        detectors,
        lhcFill,
        triggerValue,
        dcs, dd_flp, epn,
        tfbDdMode,
        pdpWorkflowParameters,
        runType,
        pdpBeamType,
        readoutCfgUri,
    } = run;

    let definition = null;

    if (
        dcs && dd_flp && epn
        && triggerValue === 'CTP'
        && COSMIC_OR_PHYSICS_TF_BUILDER_MODE.includes(tfbDdMode)
        && pdpWorkflowParameters?.includes('CTF')
    ) {
        const { stableBeamsStart } = lhcFill ?? {};

        // Physics or cosmics
        if (detectors && detectors?.includes('ITS') || detectors?.includes('FT0') && stableBeamsStart) {
            definition = RunDefinition.Physics;
        } else {
            definition = RunDefinition.Cosmic;
        }
    } else {
        // Technical or Synthetic
        if (runType === 'technical' && pdpBeamType === 'technical') {
            definition = RunDefinition.Technical;
        } else if (
            !dcs
            && triggerValue === 'OFF'
            && readoutCfgUri?.match(/^file:\/\/\/.*replay.*\/chf$/)
            && readoutCfgUri?.match(/^file:\/\/\/.*(pp|pbpb).*\/chf$/)
            && !pdpWorkflowParameters?.includes('CTF')
        ) {
            definition = RunDefinition.Synthetic;
        }
    }

    return definition;
};

module.exports = {
    getRunDefinition,
    RunDefinition,
    COSMIC_OR_PHYSICS_TF_BUILDER_MODE,
};
