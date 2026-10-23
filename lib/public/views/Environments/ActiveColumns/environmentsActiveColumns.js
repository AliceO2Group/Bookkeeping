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

import { CopyToClipboardComponent, h } from '/js/src/index.js';
import { iconPlus } from '/js/src/icons.js';
import { formatTimestamp } from '../../../utilities/formatting/formatTimestamp.js';
import { dataTakingConfiguration } from '../../../components/common/formatting/dataTakingConfiguration.js';
import { linkWithActionsDropdown } from '../../../components/common/selection/infoLoggerButtonGroup/linkWithActionsDropdown.js';
import { formatRunsList } from '../../Runs/format/formatRunsList.js';
import { displayEnvironmentStatus } from '../format/displayEnvironmentStatus.js';
import { infologgerLinksComponents } from '../../../components/common/externalLinks/infologgerLinksComponents.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';;
import { environmentStatusHistoryLegendComponent } from '../../../components/environments/environmentStatusHistoryComponent.js';
import { overflowBalloon } from '../../../components/common/popover/overflowBalloon.js';
import { infoTooltip } from '../../../components/common/popover/infoTooltip.js';
import { aliEcsEnvironmentLinkComponent } from '../../../components/common/externalLinks/aliEcsEnvironmentLinkComponent.js';
import { formatEnvironmentStatusHistory } from '../format/formatEnvironmentStatusHistory.js';
import { parseEnvironmentConfiguration } from '../format/parseEnvironmentConfiguration.js';
import { timeRangeFilter } from '../../../components/Filters/common/filters/timeRangeFilter.js';
import { checkboxes } from '../../../components/Filters/common/filters/checkboxFilter.js';
import { textInputFilter } from '../../../components/Filters/common/filters/textInputFilter.js';

/**
 * List of active columns for the environments overview
 *
 * The current status is displayed with its message and the status history with the time spent running by the environment
 */
export const environmentsActiveColumns = {
    id: {
        name: 'Environment',
        size: 'w-environments-id-column',
        classes: 'f6',
        visible: true,
        primary: true,
        noEllipsis: true,

        /**
         * Display the id of the environment as a link with its actions
         *
         * @param {string} environmentId the id of the environment
         * @param {Environment} environment the environment
         * @return {Component} the environment id
         */
        format: (environmentId, { status, runs }) => linkWithActionsDropdown(
            `row${environmentId}-id`,
            environmentId,
            'env-details',
            { environmentId },
            [
                h(CopyToClipboardComponent, { value: environmentId, id: environmentId }, 'Copy Environment Id'),
                ...infologgerLinksComponents({ environmentId }),
                status === 'RUNNING'
                    ? aliEcsEnvironmentLinkComponent(environmentId)
                    : null,
                frontLink(
                    h('span.flex-row.items-center.g1', [iconPlus(), 'Add log']),
                    'log-create',
                    { environmentIds: [environmentId], ...runs.length > 0 && { runNumbers: runs.map((run) => run.runNumber) } },
                    { id: 'add-log-link', class: 'btn btn-primary h2' },
                ),
            ],
        ),

        /**
         * Environment IDs filter component
         *
         * @param {object} environmentOverviewModel the overview model
         * @param {FilteringModel} environmentOverviewModel.filteringModel the filtering model
         * @return {Component} the filter component
         */
        filter: ({ filteringModel }) => textInputFilter(filteringModel, 'ids', 'e.g. CmCvjNbg, TDI59So3d...'),
    },
    status: {
        name: 'Current Status',
        visible: true,
        sortable: false,
        size: 'w-environments-status-column',
        classes: 'f6',
        noEllipsis: true,

        /**
         * Display the current status of the environment, with its message below it
         *
         * @param {*} _ unused, the status is read from the environment
         * @param {Environment} environment the environment
         * @return {Component} the current status and its message
         */
        format: (_, environment) => h('', [
            h(`#row${environment.id}-currentStatus`, displayEnvironmentStatus(environment)),
            h(`#row${environment.id}-statusMessage.f7.gray-darker`, overflowBalloon(environment.statusMessage || '-')),
        ]),

        /**
         * Status filter component
         *
         * @param {EnvironmentOverviewModel} environmentOverviewModel the environment overview model
         * @return {Component} the filter component
         */
        filter: (environmentOverviewModel) => checkboxes(environmentOverviewModel.filteringModel.get('currentStatus')),
    },
    createdAt: {
        name: 'Created At',
        visible: true,
        sortable: false,
        size: 'w-environments-created-column',
        classes: 'f6',
        noEllipsis: true,
        format: (timestamp) => formatTimestamp(timestamp, true),

        /**
         * CreatedAt filter component
         *
         * @param {EnvironmentOverviewModel} environmentOverviewModel the environment overview model
         * @return {Component} the filter component
         */
        filter: (environmentOverviewModel) => timeRangeFilter(environmentOverviewModel.filteringModel.get('created')),
    },
    historyItems: {
        name: h('.flex-row.g2.items-center', ['Status History', infoTooltip(environmentStatusHistoryLegendComponent())]),
        visible: true,
        sortable: false,
        size: 'w-environments-history-column',
        classes: 'f6',
        noEllipsis: true,
        format: (historyItems, { id }) => formatEnvironmentStatusHistory(historyItems, id),

        /**
         * Status history filter component
         *
         * @param {object} environmentOverviewModel the overview model
         * @param {FilteringModel} environmentOverviewModel.filteringModel the filtering model
         * @return {Component} the filter component
         */
        filter: ({ filteringModel }) => textInputFilter(filteringModel, 'statusHistory', 'e.g. D-R-X'),
    },
    runs: {
        name: 'Runs',
        visible: true,
        sortable: false,
        size: 'w-environments-runs-column',
        classes: 'f6',
        format: formatRunsList,
        balloon: true,

        /**
         * Run numbers filter component
         *
         * @param {object} environmentOverviewModel the overview model
         * @param {FilteringModel} environmentOverviewModel.filteringModel the filtering model
         * @return {Component} the filter component
         */
        filter: ({ filteringModel }) => textInputFilter(filteringModel, 'runNumbers', 'e.g. 553203, 553221, ...'),
    },
    configuration: {
        name: 'Configuration',
        visible: true,
        sortable: false,
        size: 'w-environments-configuration-column',
        classes: 'f6',
        noEllipsis: true,

        /**
         * Display the number of EPNs and FLPs, the DCS state and the trigger of the environment, two by line, as for the runs
         *
         * @param {*} _ unused, the configuration is read from the environment
         * @param {Environment} environment the environment
         * @return {Component|string} the configuration, or a dash if the environment has no valid configuration
         */
        format: (_, { id, rawConfiguration }) => {
            const configuration = parseEnvironmentConfiguration(rawConfiguration);
            return configuration ? dataTakingConfiguration(`row${id}`, configuration) : '-';
        },
    },
    detectors: {
        name: 'Detectors',
        visible: true,
        sortable: false,
        classes: 'f6',
        noEllipsis: true,

        /**
         * Display the number of detectors of the environment followed by their names, on a single line
         *
         * @param {*} _ unused, the detectors are read from the configuration of the environment
         * @param {Environment} environment the environment
         * @return {Component|string} the detectors, or a dash if the environment has none
         */
        format: (_, { id, rawConfiguration }) => {
            const detectors = parseEnvironmentConfiguration(rawConfiguration)?.detectors ?? [];
            return detectors.length > 0
                ? h(`#row${id}-detectors`, overflowBalloon(h('', [
                    h('.badge.bg-gray-light.mr1', detectors.length),
                    detectors.join(', '),
                ])))
                : '-';
        },
    },
};
