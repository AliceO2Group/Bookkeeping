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

/**
 * States if the given run may be a physics run or not, depending on if it is related to a stable beam
 *
 * @param {object} run the run to check for definition
 *
 * @return {boolean} true if the run is a physic run
 */
export const isPotentiallyPhysicsRun = ({ detectors, dd_flp, dcs, epn, triggerValue }) => {
    let containsFV0OrITS = false;
    for (const detector of detectors.split(',')) {
        if (['FV0', 'ITS'].includes(detector.trim())) {
            containsFV0OrITS = true;
            break;
        }
    }

    return containsFV0OrITS && dd_flp && dcs && epn && triggerValue === 'CTP';
};
