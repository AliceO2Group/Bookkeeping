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
import { markdownDisplay } from '../common/markdown/markdown.js';
import { detailsFrontLinks } from '../common/navigation/frontLinks.js';
import { replyButton } from './replyButton.js';
import { linkButton } from './linkButton.js';

/**
 * A collection of fields to show per log detail, optionally with special formatting
 *
 * @param {string} authenticationToken authentication token necessary to display attachments
 * @return {Object} A key-value collection of all relevant fields
 */
const activeFields = (authenticationToken) => ({
    id: {
        name: 'ID',
        visible: true,
    },
    author: {
        name: 'Source',
        visible: true,
        format: (author) => author.name,
    },
    createdAt: {
        name: 'Created',
        visible: true,
        format: (timestamp) => formatTimestamp(timestamp),
    },
    tags: {
        name: 'Tags',
        visible: true,
        format: (tags) => h('div.flex-row.flex-wrap', tags.map(({ text }) => h('div.badge.white.bg-gray.mr1', text))),
    },
    runs: {
        name: 'Runs',
        visible: true,
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
const collapseButton = (log, onClick) => h('a.btn.btn-primary', {
    id: `collapse-${log.id}`,
    onclick: onClick,
}, 'Collapse');

/**
 * Returns a log's content display
 *
 * @param {Log} log the log to display
 * @return {Component} the log's content display
 */
const textBox = (log) => h(
    `div#log-id-${log.id}`,
    markdownDisplay(log.text, {
        classes: 'w-100',
        id: `log-content-${log.id}`,
    }),
);

/**
 * Displays a given log in expanded format
 *
 * @param {Log} log all data related to the log
 * @param {boolean} highlight indicator if this log should be highlighted
 * @param {boolean} showLogTitle indicator if the title of this log should be visible
 * @param {boolean} showLinkButton indicator if the button to copy the url of this log should be visible
 * @param {function} onCollapse function called when the log should be collapsed
 * @param {string} authenticationToken the authentication token to use in attachment links
 * @return {Component} the log's display component
 */
export const logExpanded = (log, highlight, showLogTitle, showLinkButton, onCollapse, onCopyLog, authenticationToken) => {
    const logFields = activeFields(authenticationToken);

    return h(
        `#log-${log.id}.w-100.m1.p3.shadow-level1${highlight ? '.b1.b-primary' : ''}`,
        h(
            'div.flex-wrap.justify-between.mv1',
            showLogTitle ? h(`h4#log-${log.id}-title`, log.title) : '',
            h('div.flex-row.justify-between.w-100', [
                h('div.flex-column.log-details-expanded', [
                    h('em', `${logFields.author.format(log.author)}, (${logFields.createdAt.format(log.createdAt)})`),
                    ['tags', 'runs', 'attachments'].map((key) =>
                        h(`div#log-${log.id}-${key}.flex-row`, [
                            h('div.mr2', `${logFields[key].name}:`),
                            logFields[key].format(log[key]),
                        ])),
                ]),
                h('div.flex-row', { style: 'align-items: flex-start' }, [
                    linkButton(log),
                    replyButton(log),
                    collapseButton(log, onCollapse),
                ]),
            ]),
        ),
        textBox(log),
    );
};
