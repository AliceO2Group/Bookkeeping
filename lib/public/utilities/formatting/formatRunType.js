/**
 * @license
 * Copyright 2019-2020 CERN and copyright holders of ALICE O2.
 * See http://alice-o2.web.cern.ch/copyright for details of the copyright holders.
 * All rights not expressly granted are reserved.
 *
 * This software is distributed under the terms of the GNU General Public
 * License v3 (GPL Version 3), copied verbatim in the file "COPYING".
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

/**
 * Fetches the run type and formats on the given state of the fetch
 * @param {string|undefined|object} runType The run type can be an id, name or null
 *
 * @returns {string} The name or id or a '-' if null
 */
export function formatRunType(runType) {
    if (typeof runType === 'string') {
        return runType;
    }
    return runType.name ? runType.name : '-';
}
