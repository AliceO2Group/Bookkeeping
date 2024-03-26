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
import { TriggerValue } from '../../../domain/enums/TriggerValue.js';

const MISSING_TRIGGER_START_WARNING = 'O2 start is displayed because trigger stop is missing';

/**
 * Format a given run's start date
 *
 * @param {Run} run the run for which start date must be formatted
 * @param {boolean} inline true if the date must be inlined
 * @return {Component} the formatted start date
 */
export const formatRunStart = (run, inline) => {
    const { timeO2Start, timeTrgStart, triggerValue } = run;

    if (timeTrgStart || triggerValue === TriggerValue.Off) {
        return formatTimestamp(timeTrgStart || timeO2Start, inline);
    }

    if (timeO2Start) {
        if (inline) {
            return h('span', [
                h('.flex-row.items-center.g2', [
                    formatTimestamp(timeO2Start, inline),
                    tooltip(iconWarning(), MISSING_TRIGGER_START_WARNING),
                ]),
            ]);
        } else {
            const { date, time } = getLocaleDateAndTime(timeO2Start);
            return h('', [
                h('', date),
                h('.flex-row.g2.items-center', [h('', time), tooltip(iconWarning(), MISSING_TRIGGER_START_WARNING)]),
            ]);
        }
    }
    return '-';
};
