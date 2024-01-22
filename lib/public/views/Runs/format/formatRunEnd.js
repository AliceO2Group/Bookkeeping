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
import { iconWarning, h } from '/js/src/index.js';
import { getLocaleDateAndTime } from '../../../utilities/dateUtils.js';
import { tooltip } from '../../../components/common/popover/tooltip.js';

const MISSING_TRIGGER_STOP_WARNING = 'O2 stop is displayed because trigger stop is missing';

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
    }
    if (run.timeO2End) {
        const { date, time } = getLocaleDateAndTime(run.timeO2End);
        const content = inline
            ? h('span', [
                h('.flex-row.items-center.g2', [
                    formatTimestamp(run.timeO2End, inline),
                    tooltip(iconWarning(), MISSING_TRIGGER_STOP_WARNING),
                ]),
            ])
            : h('', h('', date), h('.flex-row.g2.items-center', [h('', time), tooltip(iconWarning(), MISSING_TRIGGER_STOP_WARNING)]));
        return content;
    }
    return '-';
};
