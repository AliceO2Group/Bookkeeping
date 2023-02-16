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
 * Returns true if the given parameter is **undefined**, or all of its values (if it's an array) or properties (if it's an object) are
 * recursively some empty shells too
 *
 * @param {*} [subject] the parameter to test
 * @return {boolean} true if the subject is empty
 */
const isAnEmptyShell = (subject) => {
    if (subject === undefined) {
        return true;
    }

    if (typeof subject === 'object' && subject !== null || Array.isArray(subject)) {
        for (const key in subject) {
            if (!isAnEmptyShell(subject[key])) {
                return false;
            }
        }

        return true;
    }

    // Value is neither an object, an array or undefined, it is not an empty shell
    return false;
};

exports.isAnEmptyShell = isAnEmptyShell;
