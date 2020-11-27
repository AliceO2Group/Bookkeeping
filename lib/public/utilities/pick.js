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
 * Returns an object composed of the picked object properties
 *
 * @param {Object} obj The source object.
 * @param {Array} keys The property paths to pick.
 * @returns {Object} Returns the new object.
 */
const pick = (obj, keys) => Object.fromEntries(Object.entries(obj)
    .filter(([key]) => keys.includes(key)));

export default pick;
