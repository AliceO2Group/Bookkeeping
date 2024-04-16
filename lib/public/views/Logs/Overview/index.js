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
import { table } from '../../../components/common/table/table.js';
import { logsActiveColumns } from '../ActiveColumns/logsActiveColumns.js';
import { estimateDisplayableRowsCount } from '../../../utilities/estimateDisplayableRowsCount.js';
import { paginationComponent } from '../../../components/Pagination/paginationComponent.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';
import { filtersPanelPopover } from '../../../components/Filters/common/filtersPanelPopover.js';
import { excludeAnonymousLogAuthorToggle } from '../../../components/Filters/LogsFilter/author/authorFilter.js';
import { LogsOverviewTreeModel } from './LogsOverviewTreeModel.js';

const TABLEROW_HEIGHT = 69;
// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const PAGE_USED_HEIGHT = 215;

/**
 * Build components in case of logs retrieval success
 * @param {Model} model model to access global functions
 * @return {Component} Returns a vnode with the table containing the logs
 */
const logOverviewScreen = ({ logs: logsModel }) => {
    const { overviewModel: { current } } = logsModel;

    if (current instanceof LogsOverviewTreeModel) {
        const logNodesMappedById = new Map();
        const logDepthMap = new Map(); // Store the depth for each log

        const logs = current.logs.apply({
            Success: (logNodes) => {
                const allLogs = [];

                // eslint-disable-next-line require-jsdoc
                const flattenLogs = (node, logsArray, depth) => {
                    logNodesMappedById.set(node.log.id, node);
                    logDepthMap.set(node.log.id, depth);
                    logsArray.push(node.log);
                    node.children.match({
                        Success: (childNodes) => {
                            childNodes.forEach((childNode) => {
                                flattenLogs(childNode, logsArray, depth + 1);
                            });
                        },
                        Other: () => null,
                    });
                };

                // Recursively flatten all logs starting from the top level
                logNodes.forEach((logNode) => {
                    flattenLogs(logNode, allLogs, 0);
                });
                return allLogs;
            },
        });

        return h('', [
            h('.flex-row.justify-between.header-container.pv2', [
                h('', ''),
                actionButtons(logsModel),
            ]),
            h('.w-100.flex-column', [
                table(logs, {
                    ...logsActiveColumns,
                    title: {
                        ...logsActiveColumns.title,
                        format: (_, log) => {
                            const node = logNodesMappedById.get(log.id);
                            const depth = logDepthMap.get(log.id) || 0;
                            return h('span', {
                                onclick: () => current.fetchReplies(node),
                                style: { cursor: 'pointer' },
                                innerHTML: `${formatThreadedTitle(log, depth, node.open)}`,
                            });
                        },
                    },
                }, null, null, { sort: current.overviewSortModel }),
                paginationComponent(current.pagination),
            ]),
        ]);
    } else {
        current.pagination.provideDefaultItemsPerPage(estimateDisplayableRowsCount(
            TABLEROW_HEIGHT,
            PAGE_USED_HEIGHT,
        ));

        return h('', [
            h('.flex-row.justify-between.header-container.pv2', [
                h('.flex-row.g3', [
                    filtersPanelPopover(current, logsActiveColumns),
                    excludeAnonymousLogAuthorToggle(current.authorFilter),
                ]),
                actionButtons(logsModel),
            ]),
            h('.w-100.flex-column', [
                table(current.logs, logsActiveColumns, null, null, { sort: current.overviewSortModel }),
                paginationComponent(current.pagination),
            ]),
        ]);
    }
};

/**
 * Returns the action buttons of the page
 *
 * @param {LogsModel} logsModel The model object that controls the logs overview
 * @returns {Component} A button which will redirect to creation of logs and a button that toggles the log view.
 */
const actionButtons = (logsModel) => h('.flex-row.g3', [
    toggleLogsButton(logsModel),
    frontLink('Add Log Entry', 'log-create', null, { class: 'btn btn-primary h2' }),
]);

/**
 * Returns the button that toggles the log view between list and threaded
 *
 * @param {LogsModel} logsModel The model object that controls the logs overview
 * @returns {Component} A button that toggles the log view.
 */
const toggleLogsButton = (logsModel) => h('button.btn.btn-secondary.ml2', {
    onclick: () => {
        logsModel.overviewModel.toggleLogsView();
        logsModel.loadOverview();
    },
    class: 'btn btn-primary h2',
}, `${logsModel.overviewModel.isOverviewThreaded() ? 'List' : 'Threaded'} view`);

/**
 * Returns a correctly formatted string to represent its position in the threaded view
 *
 * @param {Log} log The log object
 * @param {number} depth The depth of the log in the threaded tree view
 * @param {boolean} isOpen Indicates if the log's children are visible
 * @returns {String} A correctly formatted string to represent the threaded view
 */
const formatThreadedTitle = (log, depth, isOpen) => {
    const hasChildren = log.replies;
    let prefix = '';
    if (depth > 0) {
        prefix += `${'&nbsp;'.repeat(depth * 4)}|--`;
    } else {
        prefix += hasChildren ? '|--' : `|${'&nbsp;'.repeat(4)}`;
    }
    const icon = isOpen ? ' v' : ' >';
    console.log(icon);
    prefix += hasChildren ? icon : `${'&nbsp;'.repeat(3)}`;
    console.log(prefix);

    return `${prefix} ${log.title}`;
};

export default (model) => logOverviewScreen(model);
