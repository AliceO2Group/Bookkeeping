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
 * Expand query-like formatted keys of a object { a[b][c]: x } to { a: { b: { c: x } } }
 *
 * @param {object} obj a object
 * @return {object} obj
 */
export function expandQueryLikeNestedKey(obj) {
    const result = {};

    for (const nestedKey in obj) {
        const value = obj[nestedKey];
        const subKeys = nestedKey.split(/[[\]]/).filter(Boolean);

        let currentNestedObj = result;
        for (let i = 0; i < subKeys.length; i++) {
            const key = subKeys[i];
            if (i === subKeys.length - 1) {
                currentNestedObj[key] = value;
            } else {
                if (!(key in currentNestedObj)) {
                    currentNestedObj[key] = {};
                }
                currentNestedObj = currentNestedObj[key];
            }
        }
    }

    return result;
}
