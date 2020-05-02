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
 * Test whether an object looks like a promise.
 *
 * @param {Object} obj The object to test.
 * @returns {Boolean} Whether the object looks like a promise.
 */
const isPromise = (obj) => {
    if (!obj) {
        return false;
    }

    if (typeof obj !== 'object' && typeof obj !== 'function') {
        return false;
    }

    return typeof obj.then === 'function' || obj.constructor.name === 'AsyncFunction';
};

module.exports = isPromise;
