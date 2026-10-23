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

/**
 * Display the status history of an environment: the acronym of each status in its color, with the time the environment stayed in it below it,
 * separated by chevrons. Hovering a status displays its message and the time it was reached
 *
 * @param {{status: string, statusMessage: string, createdAt: number}[]} historyItems the history items of the environment, sorted
 * @return {Component} the status history
 */
export const formatEnvironmentStatusHistory = (historyItems) => h(
    '.flex-row.flex-wrap.items-start.g1',
    historyItems.flatMap(({ status, statusMessage, createdAt }, index) => {
        const nextItem = historyItems[index + 1];
        return [
            h('span.gray-dark', '\u203A'),
            tooltip(
                h('.flex-column.items-center', [
                    h('strong', coloredEnvironmentStatusComponent(status, StatusAcronym[status])),
                    h('.f7.gray-darker', nextItem ? formatDuration(nextItem.createdAt - createdAt) : '\u00A0'),
                ]),
                h('.flex-column', [
                    h('strong', status),
                    statusMessage && h('', statusMessage),
                    h('.f7', formatTimestamp(createdAt, true)),
                ]),
            ),
        ];
    }).slice(1),
);
