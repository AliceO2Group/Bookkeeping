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
 * Per enum supplementary steps to apply respectively after removing enum name prefix (`fromEnum` function) to get the js value and before
 * adding the enum name prefix (`toEnum` function) to get the enum value
 *
 * @type {Map<string, {fromEnum: (function(string): string), toEnum: (function(string): string)}>}
 */
const enumSpecificSupplementarySteps = new Map(Object.entries({
    RunQuality: {
        fromEnum: (enumValue) => enumValue.toLowerCase(),
        toEnum: (jsValue) => jsValue.toUpperCase(),
    },
}));

exports.enumSpecificSupplementarySteps = enumSpecificSupplementarySteps;
