/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */
import { h } from '/js/src/index.js';

/**
 * Format the beam type into a formatted string
 *
 * @param {string|null} beamType the time loss to format
 * @return {string} the formatted result
 */
export const formatBeamType = (beamType) => {
    if ((beamType ?? null) === null) {
        return '-';
    }
    const rv = beamType.split('-');
    if (rv.length === 2) {
        return h('', [rv[0], h('br'), rv[1]]);
    } else {
        return '-';
    }
};
