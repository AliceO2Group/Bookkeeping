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
import { coloredEnvironmentStatusComponent } from '../ColoredEnvironmentStatusComponent.js';
import { StatusAcronym } from '../../../domain/enums/statusAcronym.mjs';
import { tooltip } from '../../../components/common/popover/tooltip.js';
import { formatDuration } from '../../../utilities/formatting/formatDuration.mjs';
import { formatTimestamp } from '../../../utilities/formatting/formatTimestamp.js';

const RUNNING_STATUS = 'RUNNING';

/**
 * Compute the time spent in each status of the history (the duration of the last one is unknown), the total time spent running and the time
 * between the first and the last status
 *
 * @param {{status: string, createdAt: number}[]} historyItems the history items of the environment, sorted
 * @return {{durations: (number|null)[], runningDuration: number, totalDuration: number}} the durations
 */
const computeDurations = (historyItems) => {
    const durations = historyItems.map(({ createdAt }, index) => {
        const nextItem = historyItems[index + 1];
        return nextItem ? nextItem.createdAt - createdAt : null;
    });
    const runningDuration = historyItems.reduce(
        (total, { status }, index) => status === RUNNING_STATUS ? total + (durations[index] ?? 0) : total,
        0,
    );
    const totalDuration = historyItems.length > 1 ? historyItems[historyItems.length - 1].createdAt - historyItems[0].createdAt : 0;

    return { durations, runningDuration, totalDuration };
};

/**
 * Display the status history of an environment on two lines: the acronym of each status in its color, separated by chevrons, then the total
 * time of the environment and the time it spent running. Hovering a status displays its message, the time it was reached and the time spent
 * in it
 *
 * @param {{status: string, statusMessage: string, createdAt: number}[]} historyItems the history items of the environment, sorted
 * @param {string} id the id of the environment, used to generate the ids of the elements
 * @return {Component} the status history
 */
export const formatEnvironmentStatusHistory = (historyItems, id) => {
    const { durations, runningDuration, totalDuration } = computeDurations(historyItems);

    return h('', [
        h(
            `#row${id}-statusChain.flex-row.items-baseline.g1`,
            historyItems.flatMap(({ status, statusMessage, createdAt }, index) => [
                h('span.gray-dark', '\u203A'),
                tooltip(
                    h('strong', coloredEnvironmentStatusComponent(status, StatusAcronym[status])),
                    h('.flex-column', [
                        h('strong', status),
                        statusMessage && h('', statusMessage),
                        h('.f7', formatTimestamp(createdAt, true)),
                        durations[index] !== null && h('.f7', `Stayed ${formatDuration(durations[index])}`),
                    ]),
                ),
            ]).slice(1),
        ),
        h(`#row${id}-statusSummary.flex-row.g3.f7.gray-darker`, [
            h('span', ['Total ', h('span.black', formatDuration(totalDuration))]),
            h('span', ['Running ', h('span.black', formatDuration(runningDuration))]),
        ]),
    ]);
};
