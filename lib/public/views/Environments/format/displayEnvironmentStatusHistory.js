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
import { h } from '/js/src/index.js';
import { STATUS_ACRONYMS } from '../../../domain/enums/statusAcronyms.js';
import { coloredEnvironmentStatusComponent } from '../ColoredEnvironmentStatusComponent.js';

/**
 * Display the given environment's status history string
 *
 * @param {Environment} environment the environment for which status should be displayed
 * @return {vnode} the resulting component
 */
export const displayEnvironmentStatusHistory = (environment) => {
    const { historyItems } = environment;

    const statusHistory = historyItems
        .filter(({ status }) => status in STATUS_ACRONYMS)
        .map(({ status }) => ({ status, content: STATUS_ACRONYMS[status] }));

    return h(
        '.flex-row.flex-wrap.table-cl-mh-2',
        [statusHistory.map((value, index) => getStatusHistoryItem(value, index, statusHistory.length))],
    );
};

/**
 * Display the given environment's status history string
 *
 * @param {Object} value The value of the status history item
 * @param {number} index the position in the list of status history items
 * @param {number} historyItemsLength the historyItemsLength of the status history items
 * @return {vnode} the resulting status history item
 */
export const getStatusHistoryItem = (value, index, historyItemsLength) => h('.flex-row', [
    coloredEnvironmentStatusComponent(value.status, value.content),
    h('', index < historyItemsLength - 1 ? '-' : ''),
]);
