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
import { frontLink } from '../common/navigation/frontLink.js';

/**
 * A collection of fields to show per log detail, optionally with special formatting
 *
 * @param {Object} model Pass the model to access the defined functions.
 * @return {Object} A key-value collection of all relevant fields
 */
const activeFields = (model) => ({
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
        format: (tags) => tags && tags.length > 0 ? tags.map(({ text }) => text).join(', ') : '-',
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
        format: (attachments) => detailsFrontLinks(attachments, ({ fileName, originalName, id }) => ({
            content: originalName,
            href: `/api/attachments/${id}?token=${model.session.token}`,
            attributes: { download: fileName, class: 'break-all' },
        })),
    },
});

/**
 * Returns a reply to Log button.
 *
 * @param {Object} model Pass the model to access the defined functions.
 * @param {Object} post all data related to the post
 * @return {vnode} The reply button.
 */
const replyButton = (model, post) => frontLink(
    'Reply',
    'log-create',
    { parentLogId: post.id },
    {
        id: `reply-to-${post.id}`,
        class: 'btn btn-primary',
        style: 'float: right;',
    },
);

/**
 * Returns a Collapse button.
 *
 * @param {Object} model Pass the model to access the defined functions.
 * @param {Object} post all data related to the post
 * @return {vnode} The reply button.
 */
const collapsedButton = (model, post) => h('a.btn.btn-primary', {
    id: `show-collapsed-${post.id}`,
    style: 'float: right; margin-right: 5px',
    onclick: () => {
        model.logs.collapsePost(post.id);
    },
}, 'Collapse');

/**
 * Returns a post text box.
 *
 * @param {Integer} index ID of the Post.
 * @param {Object} model Pass the model to access the defined functions.
 * @param {Object} post contents.
 * @return {vnode} The reply button.
 */
const textBox = (index, model, post) => h(
    `div#post-id${index}`,
    markdownDisplay(post.text, {
        classes: 'w-100',
        id: `post-content${index}`,
    }),
);

/**
 * A singular post which is part of a log
 *
 * @param {Object} model Pass the model to access the defined functions.
 * @param {Object} post all data related to the post
 * @param {Number} index the identification index of the post
 * @param {Boolean} highlight indicator if this post should be highlighted
 * @return {vnode} Returns a post
 */
const entry = (model, post, index, highlight) => {
    const postFields = activeFields(model);

    return h(`#post${index}.w-100.flex-row.m1.shadow-level1`, [
        h(`.w-20.p2.shadow-level1${highlight ? '.bg-gray-light' : ''}`, [
            h('table', [
                h('tbody', Object.entries(postFields)
                    .map(([
                        key, {
                            name,
                            format,
                            visible,
                        },
                    ]) => visible && h(`tr#post${index}-${key}`, [
                        h('td.text-right', { style: 'font-weight: bold' }, `${name}:`),
                        h('td', format ? format(post[key]) : post[key]),
                    ]))),
            ]),
        ]),
        h('.w-80.p2.shadow-level1', h('div.flex-wrap.justify-between.mv1', h(`h4#post${index}title`, post.title), h('div', [
            replyButton(model, post),
            collapsedButton(model, post),
        ])), textBox(index, model, post)),
    ]);
};

export default entry;
