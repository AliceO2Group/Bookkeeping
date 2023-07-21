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
import errorAlert from '../../../components/common/errorAlert.js';
import spinner from '../../../components/common/spinner.js';
import { logCollapsed } from '../../../components/Log/logCollapsed.js';
import { logExpanded } from '../../../components/Log/logExpanded.js';
import scrollTo from '../../../utilities/scrollTo.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';

/**
 * A collection of details relating to a log
 * @param {LogTreeViewModel} treeViewModel model of the tree view
 * @param {string} authenticationToken the token to use to display attachments
 * @return {Component} Return the view of the table with the filtering options
 */
export const logTreeViewComponent = (treeViewModel, authenticationToken) => {
    const { detailedPostsIds, selectedLogId, logTreeLeafs: logTreeLeafsRemoteData } = treeViewModel;
    return logTreeLeafsRemoteData.match({
        NotAsked: () => null,
        Loading: () => spinner(),
        Success: (logTreeLeafs) => {
            const parentLogTitle = logTreeLeafs[0].log.title;

            // eslint-disable-next-line require-jsdoc
            const logTreeLeafDisplay = (log, level, isCollapsed) => h(
                '.mw-100',
                {
                    style: {
                        'margin-left': `${2 * level}rem`,
                    },
                },
                isCollapsed
                    ? logCollapsed(
                        log,
                        log.id === selectedLogId,
                        !(log.title === parentLogTitle),
                        () => treeViewModel.expandLog(log.id),
                        () => treeViewModel.copyLogToClipboard(log.id),
                    )
                    : logExpanded(
                        log,
                        log.id === selectedLogId,
                        !(log.title === parentLogTitle),
                        () => treeViewModel.collapseLog(log.id),
                        () => treeViewModel.copyLogToClipboard(log.id),
                        authenticationToken,
                    ),
            );

            return h('', [
                h('div.mv2.flex-row.items-center', [
                    h('h2', `${parentLogTitle}`),
                    h('button.btn.btn-primary.mh2#toggleCollapse', {
                        onclick: () => {
                            treeViewModel.toggleAllPostView();
                        },
                    }, treeViewModel.isShowAll() ? 'Collapse all' : 'Show all'),
                ]),
                h('.w-100.flex-column', {
                    oncreate: () => scrollTo(`#log-${selectedLogId}`, 150),
                }, logTreeLeafs.map(({ log, level }) => logTreeLeafDisplay(log, level, !detailedPostsIds.includes(log.id)))),
            ]);
        },
        Failure: (errors) => h('', [
            errors.map(errorAlert),
            frontLink('Return to Overview', 'log-overview', {}, { class: 'btn btn-primary' }),
        ]),
    });
};
