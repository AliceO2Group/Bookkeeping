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
import spinner from '../../../components/common/spinner.js';
import errorAlert from '../../../components/common/errorAlert.js';
import { formatTimestamp } from '../../../utilities/formatting/formatTimestamp.js';
import { table } from '../../../components/common/table/table.js';
import { runsActiveColumns } from '../../Runs/ActiveColumns/runsActiveColumns.js';
import { coloredEnvironmentStatusComponent } from '../ColoredEnvironmentStatusComponent.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';
import { tabbedPanelComponent } from '../../../components/TabbedPanel/tabbedPanelComponent.js';
import { ENVIRONMENT_DETAILS_PANELS_KEYS } from './EnvironmentDetailsModel.js';
import { LHC_FILL_DETAILS_PANELS_KEYS } from '../../LhcFills/Detail/LhcFillDetailsModel.js';
import { logsActiveColumns } from '../../Logs/ActiveColumns/logsActiveColumns.js';
import { getInfologgerLinksUrls } from '../../../services/externalRouting/getInfologgerLinksUrls.js';

/**
 * Returns the environment's detail page
 *
 * @param {Model} model the general model
 * @return {Component} the page's component
 */
export const EnvironmentDetailsPage = ({ envs: { detailsModel } }) => detailsModel.environment.match({
    NotAsked: () => null,
    Loading: () => spinner(),

    /**
     * Display the environment's details
     * @param {Environment} environment the environment displayed
     * @return {Component} the details
     * @constructor
     */
    Success: (environment) => {
        const { id, status, createdAt, historyItems, runs } = environment;
        const { flp: flpInfologgerLinkUrl, epn: epnInfologgerLinkUrl } = getInfologgerLinksUrls({ environmentId: id });

        // QueryParameters with environmentId as default, and runNumber if available
        const queryParameters = {
            environmentIds: [id],
            ...runs.length > 0 && { runNumbers: runs.map((run) => run.runNumber) },
        };

        const history = [];
        for (const historyIndex in historyItems) {
            history.push(historyItemComponent(
                historyItems[historyIndex],
                { separator: historyIndex > 0 },
            ));
        }

        return h('.flex-column.g3', [
            h('', [
                h('.flex-row.items-center.justify-between.g3', [
                    h('.flex-row.items-center.g3', [
                        h('h2', ['Environment ', h('strong', id)]),
                        h('#environment-status-badge.f3.badge.bg-primary.white', status),
                    ]),
                    frontLink(
                        'Add log to this environment',
                        'log-create',
                        queryParameters,
                        { id: 'create-log', class: 'btn btn-primary h2' },
                    ),
                ]),
                h('#environment-creation-date', [h('strong', 'Created at '), formatTimestamp(createdAt)]),
            ]),
            (flpInfologgerLinkUrl || epnInfologgerLinkUrl) && h('h3.flex-row.w-100.g2.items-baseline.mb3', [
                h('', 'Infologger: '),
                flpInfologgerLinkUrl && h('a', { href: flpInfologgerLinkUrl }, 'FLP'),
                epnInfologgerLinkUrl && h('a', { href: epnInfologgerLinkUrl }, 'EPN'),
            ]),
            h('h3', 'History'),
            h('#environment-history.flex-row.g3.flex-wrap.items-center', history),
            tabbedPanelComponent(
                detailsModel.tabbedPanelModel,
                {
                    [ENVIRONMENT_DETAILS_PANELS_KEYS.RUNS]: 'Runs',
                    [ENVIRONMENT_DETAILS_PANELS_KEYS.LOGS]: 'Logs',
                },
                {
                    [ENVIRONMENT_DETAILS_PANELS_KEYS.RUNS]: () => table(runs, runsActiveColumns, null, { profile: 'environment' }),
                    [LHC_FILL_DETAILS_PANELS_KEYS.LOGS]: (logs) => table(logs, logsActiveColumns, null, { profile: 'embeded' }),
                },
            ),
        ]);
    },
    Failure: (errors) => errorAlert(errors),
});

/**
 * Returns the component representing a history item component
 *
 * @param {EnvironmentHistoryItem} historyItem the history item to represent
 * @param {object} [options] the component's configuration
 * @param {object} [options.componentAttributes={}] optionally the list of attributes to add to the vnode
 * @param {boolean} [options.separator=true] if true, a separator will be displayed before the history item component
 * @return {Component} the history item component
 */
const historyItemComponent = (historyItem, options) => {
    const { status, createdAt } = historyItem;
    const { componentAttributes = {}, separator = true } = options || {};

    return [
        separator && h('', '>'),
        h(
            '.history-item.flex-column.items-center.shadow-level1.ph3.pv2.br3',
            componentAttributes,
            [
                h(
                    '.badge.bg-gray-light',
                    coloredEnvironmentStatusComponent(status),
                ),
                h('.text-center', ['at', formatTimestamp(createdAt, false)]),
            ],
        ),
    ];
};
