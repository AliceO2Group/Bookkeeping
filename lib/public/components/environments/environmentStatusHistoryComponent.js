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

import { tooltip } from '../common/popover/tooltip.js';
import { coloredEnvironmentStatusComponent } from '../../views/Environments/ColoredEnvironmentStatusComponent.js';
import { h } from '/js/src/index.js';
import { STATUS_ACRONYMS } from '../../domain/enums/statusAcronyms.js';

/**
 * Returns a legend for the environment status history acronyms.
 *
 * @return {Component} the resulting environment status history legend component
 */
export const environmentStatusHistoryLegendComponent = () =>
    h('', [
        h('h5', 'Status History Legend'),
        Object.keys(STATUS_ACRONYMS).map((status) =>
            h('.flex-row.justify-between', [
                h('', status),
                h('', STATUS_ACRONYMS[status]),
            ])),
    ]);

/**
 * Returns a tooltip legend for the environment status history acronyms.
 *
 * @param {{status: string, acronym: string}[]} statusHistory list of history items (full status and their acronym)
 * @return {Component} the resulting environment status history component
 */
export const environmentStatusHistoryComponent = (statusHistory) => tooltip(
    h(
        '.flex-row',
        statusHistory.map((value, index) =>
            h('.flex-row', [
                coloredEnvironmentStatusComponent(value.status, value.acronym),
                h('', index < statusHistory.length - 1 ? '-' : ''),
            ])),
    ),
    environmentStatusHistoryLegendComponent(),
);
