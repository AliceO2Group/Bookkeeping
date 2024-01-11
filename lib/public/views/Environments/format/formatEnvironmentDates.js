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

import { h } from '/js/src/index.js';
import { getLocaleDateAndTime } from '../../../utilities/dateUtils.js';

/**
 * Format a given run's start date
 *
 * @param {number|null} timestamp the timestamp to format (in milliseconds)
 * @return {Component} the formatted date
 */
export const formatEnvironmentDates = (timestamp) => {
    const { date, time } = getLocaleDateAndTime(timestamp);
    return h(
        '',
        h('', date),
        h(
            '.flex-row.g2.items-center',
            [h('', time)],
        ),
    );
};
