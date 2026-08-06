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
 * Format QC flag `to` timestamp
 *
 * @param {QcFlag} qcFlag QC flag
 * @param {boolean} inline preserved for compatibility with existing callers
 * @return {Component} formatted `to` timestamp
 */
export const formatQcFlagEnd = ({ from, to }, inline = false) => {
    if (to) {
        return formatQcFlagTimestamp(to, inline);
    } else {
        return from
            ? 'Until run end'
            : 'Whole run coverage';
    }
};
