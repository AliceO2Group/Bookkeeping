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

import { formatTimestamp } from './formatTimestamp.js';

/**
 * Returns an object composed of the picked object properties
 *
 * @param {Object} obj The source object.
 * @param {Array} keys The property paths to pick.
 * @returns {Object} Returns the new object.
 */
const pick = (obj, keys) => Object.fromEntries(Object.entries(obj)
    .filter(([key]) => keys.includes(key))

    /*
     * An awful shortcut has been taken here, this kind of specific treatment do not have place in a utility method like this one!
     * This map must be placed after the (currently unique) pick call in Runs.js line 340
     */
    .map(([key, value]) => {
        if (['timeO2Start', 'timeO2End', 'timeTrgStart', 'timeTrgEnd'].includes(key)) {
            return [
                key,
                formatTimestamp(value),
            ];
        }
        return [key, value];
    }));

export default pick;
