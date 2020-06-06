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

const deepmerge = require('deepmerge');

/**
 * Merges two given objects.
 *
 * @param {Object} base Base object to use.
 * @param {Object[]} targets Object(s) to override with.
 * @returns {Object} Merged of *base* and all *targets*.
 */
const merge = (base, ...targets) => {
    if (!targets || targets.length === 0) {
        return base;
    }

    if (targets.length === 1) {
        return deepmerge(base, targets[0]);
    }

    return merge(merge(base, targets.shift()), ...targets);
};

module.exports = merge;
