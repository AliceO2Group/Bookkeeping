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

const LEGACY_DETECTOR_NAMES_FOR_AFTER_25 = ['CPV', 'PHS'];

/**
 * Remove legacy detectors for newer LHC periods/passes (after LHC25) from the list of detectors.
 *
 * @param {Detector[]} detectors detectors to filter
 * @param {string} [label=''] name of the period or data pass
 * @param {string[]} [legacyDetectorNames=['CPV', 'PHS']] detectors to remove for newer periods after LHC25
 * @return {Detector[]} filtered detectors
 */
const filterOutLegacyDetectorsForNewerPeriods = (detectors = [], label = '') => {
    const shouldFilterOutLegacyDetectors = /LHC(2[5-9]|[3-9]\d)/.test(label ?? '');

    return detectors.filter(({ name }) => !shouldFilterOutLegacyDetectors || !LEGACY_DETECTOR_NAMES_FOR_AFTER_25.includes(name));
};

export { filterOutLegacyDetectorsForNewerPeriods };
