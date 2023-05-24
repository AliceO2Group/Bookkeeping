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
import { setCorrectStatusColor } from '../../../utilities/setCorrectStatusColor.js';

/**
 * Returns the environment's detail page
 *
 * @param {Model} model the general model
 * @return {Component} the page's component
 */
export const EnvironmentDetailsPage = (model) => model.envs.detailsModel.environment.match({
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

        const history = [];
        for (const historyIndex in historyItems) {
            history.push(historyItemComponent(
                historyItems[historyIndex],
                {
                    separator: historyIndex > 0,
                    emphasise: parseInt(historyIndex, 10) === historyItems.length - 1,
                },
            ));
        }

        return h('.flex-column.g3', [
            h('.flex-row.items-center.g3', [
                h('h2', ['Environment ', h('strong', id)]),
                h('#environment-status-badge.f3.badge.bg-primary.white', setCorrectStatusColor(status)),
            ]),
            h('#environment-creation-date', [h('strong', 'Created at '), formatTimestamp(createdAt)]),
            h('h3', 'History'),
            h('#environment-history.flex-row.g3.flex-wrap.items-center', history),
            h('h3', 'Runs'),
            h('#runs', table(runs, runsActiveColumns, null, { profile: 'environment' })),
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
 * @param {boolean} [options.emphasise=false] if true, the history item will be emphasised as being the current one
 * @return {Component} the history item component
 */
const historyItemComponent = (historyItem, options) => {
    const { status, createdAt } = historyItem;
    const { componentAttributes = {}, separator = true, emphasise = false } = options || {};

    return [
        separator && h('', '>'),
        h(
            '.history-item.flex-column.items-center.shadow-level1.ph3.pv2.br3',
            componentAttributes,
            [
                h(`.badge${emphasise ? '.bg-primary.white' : '.bg-gray-light'}`, setCorrectStatusColor(status)),
                h('.text-center', ['at', formatTimestamp(createdAt, false)]),
            ],
        ),
    ];
};
