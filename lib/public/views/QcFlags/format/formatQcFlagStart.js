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

import { formatQcFlagTimestamp } from './formatQcFlagTimestamp.js';

/**
 * Format QC flag `from` timestamp
 *
 * @param {QcFlag} qcFlag QC flag
 * @param {boolean} [inline=false] if true, the date and time will be returned as a string. Else, a component will be returned
 * with date and time being separated by a newline
 * @return {Component} formatted `from` timestamp
 */
export const formatQcFlagStart = ({ from, to }, inline = false) => {
    if (from) {
        return formatQcFlagTimestamp(from, inline);
    } else {
        return to
            ? 'Since run start'
            : 'Whole run coverage';
    }
};
