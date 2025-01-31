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
import { h, iconWarning } from '/js/src/index.js';
import { getLocaleDateAndTime } from '../../../utilities/dateUtils.mjs';
import { tooltip } from '../../../components/common/popover/tooltip.js';
import { TriggerValue } from '../../../domain/enums/TriggerValue.js';

const MISSING_TRIGGER_STOP_WARNING = 'O2 stop is displayed because trigger stop is missing';

/**
 * Format a given run's end date
 *
 * @param {Run} run the run for which end date must be formatted
 * @param {object} [configuration] eventual display configuration
 * @param {boolean} [configuration.inline] true if the date must be inlined
 * @param {boolean} [configuration.qc] true if QC run end must be displayed, i.e. if last TF timestamp must be used if available
 * @return {Component} the formatted end date
 */
export const formatRunEnd = (run, configuration) => {
    const { inline = false, qc = false } = configuration || {};
    const { timeTrgEnd, timeO2End, lastTfTimestamp, triggerValue } = run;

    let runEnd = timeTrgEnd || timeO2End;
    if (qc) {
        runEnd = lastTfTimestamp || runEnd;
    }

    if (timeTrgEnd || triggerValue === TriggerValue.Off) {
        return formatTimestamp(runEnd, inline);
    }

    if (timeO2End) {
        if (inline) {
            return h('span', [
                h('.flex-row.items-center.g2', [
                    formatTimestamp(runEnd, inline),
                    tooltip(iconWarning(), MISSING_TRIGGER_STOP_WARNING),
                ]),
            ]);
        } else {
            const { date, time } = getLocaleDateAndTime(runEnd);
            return h('', [
                h('', date),
                h('.flex-row.g2.items-center', [h('', time), tooltip(iconWarning(), MISSING_TRIGGER_STOP_WARNING)]),
            ]);
        }
    }
    return '-';
};
