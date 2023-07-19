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
    origin: {
        name: 'Class',
        visible: true,
    },
    subtype: {
        name: 'Type',
        visible: true,
    },
    tags: {
        name: 'Tags',
        visible: true,
        format: (tags) => tags && tags.length > 0 ? tags.map(({ text }) => text).join(', ') : '',
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
    subsystems: {
        name: 'Subsystems',
        visible: true,
        format: (subsystems) => subsystems && subsystems.length > 0 ? subsystems.map(({ name }) => name).join(', ') : 'None',
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
 * @param {function} onCollapse function called when the log should be collapsed
 * @param {string} authenticationToken the authentication token to use in attachment links
 * @return {Component} the log's display component
 */
export const logExpanded = (log, highlight, showLogTitle, onCollapse, authenticationToken) => {
    const logFields = activeFields(authenticationToken);
    return h(
        `#log-${log.id}.w-100.m1.p3.shadow-level1${highlight && '.b1.b-primary'}`,
        h(
            'div.flex-wrap.justify-between.mv1',
            showLogTitle ? h(`h4#log-${log.id}-title`, log.title) : '',
            h('div.flex-row.justify-between.w-100', [
                h('div.flex-column.log-details', [
                    h('em', `${logFields.author.format(log.author)}, (${logFields.createdAt.format(log.createdAt)})`),
                    log.tags.length != 0 && h(`div#log-${log.id}-tags`, `${logFields.tags.format(log.tags)}`),
                    log.runs.length != 0 && h(`div#log-${log.id}-runs`, logFields.runs.format(log.runs)),
                    log.attachments.length != 0 && h(`div#log-${log.id}-attachments`, logFields.attachments.format(log.attachments)),
                ]),
                h('div.flex-row', { style: 'align-items: flex-start' }, [
                    replyButton(log),
                    collapseButton(log, onCollapse),
                ]),
            ]),
        ),
        textBox(log),
    );
};
