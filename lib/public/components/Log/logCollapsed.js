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
import { replyButton } from './replyButton.js';
import { formatTimestamp } from '../../utilities/formatting/formatTimestamp.js';
import { detailsFrontLinks } from '../common/navigation/frontLinks.js';

/**
 * A collection of fields to show per log detail, optionally with special formatting
 *
 * @return {Object} A key-value collection of all relevant fields
 */
const activeFields = () => ({
    id: {
        name: 'ID',
        visible: true,
    },
    author: {
        name: 'Source',
        visible: true,
        format: (author) => author && author.name ? author.name : '-',
    },
    createdAt: {
        name: 'Created',
        visible: true,
        format: (timestamp) => formatTimestamp(timestamp),
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
});

/**
 * Returns an expand button.
 *
 * @param {Log} log the log to expand
 * @param {function} onClick function called when button is activated
 * @return {Component} the expand button component
 */
const expandButton = (log, onClick) => h('a.btn.btn-primary', {
    id: `show-collapse-${log.id}`,
    onclick: onClick,
}, 'Show');

/**
 * Returns a log's content display
 *
 * @param {Log} log the log to display
 * @param {function} onClick function called when the log's content is clicked
 * @return {Component} the log's content display
 */
const textBox = ({ text, id }, onClick) =>
    h(`a#log-id-${id}`, {
        style: 'text-decoration: none; color: black',
        onclick: onClick,
    }, h(`.text-ellipsis.w-100#log-content-${id}`, text));

/**
 * Displays a given log in short format
 *
 * @param {Log} log the log to display
 * @param {boolean} highlight indicator if this log should be highlighted
 * @param {boolean} showLogTitle indicator if the title of this log should be visible
 * @param {function} onExpand function called when the log should be expanded
 * @return {Component} the log's display component
 */
export const logCollapsed = (log, highlight, showLogTitle, onExpand) => {
    const logFields = activeFields();

    // eslint-disable-next-line require-jsdoc
    return h(
        `#log-${log.id}.w-100.m1.p3.shadow-level1${highlight && '.b1.b-primary'}`,
        h(
            'div.flex-wrap.justify-between.mv1',
            showLogTitle ? h(`h4#log-${log.id}-title`, log.title) : '',
            h('div.flex-row.justify-between.w-100', [
                h('div.flex-column.log-details', [
                    h('em', `${logFields.author.format(log.author)}, (${logFields.createdAt.format(log.createdAt)})`),
                    log.tags.length != 0 && h('div#log-${log.id}-tags', `${logFields.tags.format(log.tags)}`),
                ]),
                h('div.flex-row', { style: 'align-items: flex-start' }, [
                    replyButton(log),
                    expandButton(log, onExpand),
                ]),
            ]),
        ),
        textBox(log),
    );
};
