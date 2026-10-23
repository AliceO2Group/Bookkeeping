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

import { RunQualities } from '../../../domain/enums/RunQualities.js';

/**
 * Returns the name of the color representing the given run quality, to be used as a suffix of the color css classes (e.g. `bg-success`)
 *
 * @param {('good'| 'bad' | 'test' | 'none')} runQuality the quality of the run
 * @return {('success'|'danger'|'gray-darker')} the color name
 */
export const getRunQualityColor = (runQuality) => {
    if (runQuality === RunQualities.GOOD) {
        return 'success';
    } else if (runQuality === RunQualities.BAD) {
        return 'danger';
    }
    return 'gray-darker';
};
