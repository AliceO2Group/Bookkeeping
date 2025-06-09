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

import { RunQualities } from '../../domain/enums/RunQualities.js';
import { RUN_TAGS_DISABLING_QC } from './isRunNotSubjectToQc.js';

/**
 * Return the reason why a run is not subject to QC
 *
 * @param {Run} run a run
 * @return {string} reason
 */
export const getRunQcExclusionReason = ({ runNumber, runQuality, tags }) => {
    const reasons = [];
    if (runQuality === RunQualities.BAD) {
        reasons.push(`Quality of run ${runNumber} was changed to ${RunQualities.BAD} so it is no more subject to QC`);
    }
    if (tags.find(({ text }) => RUN_TAGS_DISABLING_QC.includes(text))) {
        reasons.push(`Run ${runNumber} was tagged as not for physics so it is no more subject to QC`);
    }
    return reasons.join('; ');
};
