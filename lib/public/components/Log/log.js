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

import { formatTimestamp } from '../../utilities/formatting/formatTimestamp.js';
import { detailsFrontLinks } from '../common/navigation/frontLinks.js';

import { logDetails } from './logDetails.js'
import { logLinkButton } from './logLinkButton.js';
import { logReplyButton } from './logReplyButton.js';
import { logText } from './logText.js'

/**
 * Provides formatting for each log field to display that field on the webpage
 * @param {string} authenticationToken token to authenticate api requests. Used for attachments
 * @return {Object} an object determining how each log field wil lbe displayed on the page
 */
const logFields = (authenticationToken) => ({
    author: {
        name: 'Source',
        format: (author) => author.name,
    },
    createdAt: {
        name: 'Created',
        format: (timestamp) => formatTimestamp(timestamp),
    },
    tags: {
        name: 'Tags',
        format: (tags) => h('div.flex-row.flex-wrap.g1', tags.map(({ text }) => h('div.badge.white.bg-gray-light.black', text))),
    },
    runs: {
        name: 'Runs',
        format: (runs) => detailsFrontLinks(runs, ({ runNumber, id }) => ({
            content: runNumber,
            page: 'run-detail',
            parameters: { id },
        })),
    },
    attachments: {
        name: 'Attachments',
        visible: true,
        format: (attachments) => detailsFrontLinks(
            attachments,
            ({ fileName, originalName, id }) => ({
                content: originalName,
                href: `/api/attachments/${id}?token=${authenticationToken}`,
                attributes: { download: fileName, class: 'break-all' },
            }),
            { bypassRouter: true },
        ),
    },
});

/**
 * Returns a collapse button.
 *
 * @param {Log} log the log to collapse
 * @param {function} onClick function called when button is activated
 * @return {Component} the collapse button component
 */
const collapseButton = (log, onClick) => h('button.btn.btn-primary', {
    id: `collapse-${log.id}`,
    onclick: onClick,
}, 'Collapse');

/**
 * Returns an expand button.
 *
 * @param {Log} log the log to expand
 * @param {function} onClick function called when button is activated
 * @return {Component} the expand button component
 */
const expandButton = (log, onClick) => h('button.btn.btn-primary', {
    id: `show-collapse-${log.id}`,
    onclick: onClick,
}, 'Show');

const expandedLogFields = ['runs', 'attachments'];

/**
 * Returns a card for the given log
 *
 * @param {Log} log all data related to the log
 * @param {boolean} highlight indicator if this log should be highlighted
 * @param {boolean} showLogTitle indicator if the title of this log should be visible
 * @param {boolean} isCollapsed indicator if the title of this log is collapsed
 * @param {boolean} showCopyUrlSuccessContent indicator as to whether to feedback to the user the log url was copied to the clipboard
 * @param {function} onCollapse function called when the log should be collapsed
 * @param {function} onExpand function called when the log should be expanded
 * @param {function} onCopyUrlSuccess function called when the url of the log has been copied to the clipboard
 * @param {string} authenticationToken token to authenticate the session with the api
 * @return {Component} the log's display component
 */
export const logComponent = (
    log,
    highlight,
    showLogTitle,
    isCollapsed,
    showCopyUrlSuccessContent,
    onCollapse,
    onExpand,
    onCopyUrlSuccess,
    authenticationToken,
) => {
    const fieldFormatting = logFields(authenticationToken);
    const logTitle = showLogTitle ? h(`h4#log-${log.id}-title`, log.title) : '';
    const displayedLogFields = isCollapsed ? [] : expandedLogFields
    const logViewButton = isCollapsed ? expandButton(log, onExpand) : collapseButton(log, onCollapse)

    return h(
        `#log-${log.id}.br2.m1.p3.shadow-level1.flex-column.g3${highlight ? '.b1.b-primary' : ''}`,
        h('div.flex-row.justify-between.', [
            h(`div.flex-column.g1.log-details-${isCollapsed ? 'collapsed' : 'expanded'}`, [
                logTitle,
                h(
                    '.flex-row.flex-wrap.g1',
                    h('em', `${fieldFormatting.author.format(log.author)} (${fieldFormatting.createdAt.format(log.createdAt)})`),
                ),
                fieldFormatting.tags.format(log.tags),
                logDetails(log, displayedLogFields, fieldFormatting)
            ]),
            h('div.flex-row.flex-shrink-0.flex-wrap.items-start.g1', [
                logLinkButton(log, showCopyUrlSuccessContent, onCopyUrlSuccess),
                logReplyButton(log),
                logViewButton
            ]),
        ]),
        h('.bt1.b-gray-light'),
        logText(log, isCollapsed),
    );
};
