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
import { environmentStatusHistoryComponent } from '../../../components/environments/environmentStatusHistoryComponent.js';

/**
 * Display the given environment's status history string
 *
 * @param {Environment} environment the environment for which status should be displayed
 * @return {vnode} the resulting component
 */
export const displayEnvironmentStatusHistoryOverview = (environment) => {
    const { historyItems } = environment;

    const statusHistory = historyItems
        .filter(({ status }) => status in STATUS_ACRONYMS)
        .map(({ status }) => ({ status, content: STATUS_ACRONYMS[status] }));

    return h(
        '.flex-row',
        environmentStatusHistoryComponent(h(
            '.flex-row',
            statusHistory.map((value, index) =>
                h('.flex-row', [
                    coloredEnvironmentStatusComponent(value.status, value.content),
                    h('', index < statusHistory.length - 1 ? '-' : ''),
                ])),
        )),
    );
};
