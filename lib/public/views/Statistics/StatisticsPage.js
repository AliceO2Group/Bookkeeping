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
import errorAlert from '../../components/common/errorAlert.js';
import spinner from '../../components/common/spinner.js';

/**
 * Render the statistics page
 *
 * @param {StatisticsPageModel} statisticsModel the page's model
 * @return {vnode} the resulting component
 * @constructor
 */
export const StatisticsPage = ({ statisticsModel }) => h('.flex-grow.flex-column', [
    h('h1', 'Statistics'),
    statisticsModel.statistics.match({
        NotAsked: () => null,
        Loading: () => spinner(),
        Failure: (errors) => errorAlert(errors),
        Success: (statistics) => [
            h('h3', 'Efficiency - 2023'),
            // Display as a table for now, graph will come later
            h('table.table.table-hover', [
                h('thead', h('tr', [
                    h('th', 'Fill number'),
                    h('th', 'Efficiency'),
                    h('th', 'Efficiency loss at start'),
                ])),
                h('tbody', statistics.map(({ fillNumber, efficiency, efficiencyLossAtStart }) => h('tr', [
                    h('td', fillNumber),
                    h('td', efficiency),
                    h('td', efficiencyLossAtStart),
                ]))),
            ]),
        ],
    }),
]);
