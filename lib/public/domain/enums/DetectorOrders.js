/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

import { DetectorType } from './DetectorTypes.js';

/**
 * Defines priority mappings for detector types.
 * Each key is a mapping between {@link DetectorType} values and their numeric priority
 * (larger values will appear first - see detectorsProvider LN88).
 *
 * - **DEFAULT**: Standard ordering used across most views.
 * - **RCT**: Ordering used in the Run Condition Table, which prioritizes PHYSICAL detectors.
 */
export const DetectorOrders = Object.freeze({
    DEFAULT: {
        [DetectorType.OTHER]: 0,
        [DetectorType.VIRTUAL]: 1,
        [DetectorType.PHYSICAL]: 2,
        [DetectorType.AOT_GLO]: 3,
        [DetectorType.AOT_EVENT]: 4,
        [DetectorType.MUON_GLO]: 5,
        [DetectorType.QC_ONLY]: 6,
    },
    RCT: {
        [DetectorType.OTHER]: 0,
        [DetectorType.AOT_GLO]: 1,
        [DetectorType.AOT_EVENT]: 2,
        [DetectorType.MUON_GLO]: 3,
        [DetectorType.VIRTUAL]: 4,
        [DetectorType.PHYSICAL]: 5,
        [DetectorType.QC_ONLY]: 6,
    },
});
