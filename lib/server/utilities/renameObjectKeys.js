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
 * Change keys of given object according to given mapping preserving corresponding values.
 * If (Ks -> Vs) belongs to sourceObject and there is (Ks -> Kt) in keysMapping
 * then (Kt -> Vs) belongs to result object
 * If (Ks -> Vs) belongs to sourceObject and there is (Ks -> true) in keysMapping
 * then (Ks -> Vs) belongs to result object
 *
 * @param {object} sourceObject object
 * @param {object<string, string|boolean>} keysMapping mapping
 * @param {object} options behaviour modifying options
 * @param {boolean} [options.prune = true] if true keys with undefined values will not be taken to result object
 * @return {object} object with changed keys
 */
function renameObjectKeys(sourceObject, keysMapping, { prune = true } = {}) {
    if (!keysMapping) {
        return sourceObject;
    }
    const result = {};
    for (const [originKey, targetKey] of Object.entries(keysMapping)) {
        if (!prune || sourceObject[originKey] !== undefined) {
            if (typeof targetKey === 'boolean') {
                if (targetKey) {
                    result[originKey] = sourceObject[originKey];
                }
            } else {
                result[targetKey] = sourceObject[originKey];
            }
        }
    }
    return result;
}

exports.renameObjectKeys = renameObjectKeys;
