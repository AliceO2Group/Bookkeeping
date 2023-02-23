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

import { formatTimestamp } from '../../../utilities/formatting/formatTimestamp.js';
import { popover } from '../../../components/common/popover/popover.js';
import { iconWarning, h } from '/js/src/index.js';

/**
 * Format a given run's end date
 *
 * @param {Run} run the run for which end date must be formatted
 * @param {boolean} inline true if the date must be inlined
 * @return {Component} the formatted end date
 */
export const formatRunEnd = (run, inline) => {
    if (run.timeTrgEnd) {
        return formatTimestamp(run.timeTrgEnd, inline);
    } else if (run.timeO2End) {
        return h(
            '.flex-row.g2',
            [formatTimestamp(run.timeO2End, inline), popover(iconWarning(), 'O2 end is displayed because trigger end is missing')],
        );
    }
    return '-';
};
