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

/**
 * A generic generator function to create a list of custom links based on custom defined properties
 * @param {Array} links The collection of objects from which to generate links
 * @param {Function} properties A function to create link properties for a specific link
 * @param {String} textKey The object key to inherit the link's name from in an array entry
 * @return {vnode} A collection of links seperated by commas
 */
const linksContainer = (links, properties, textKey) => links.length > 0
    ? h('.flex-wrap', { style: 'word-break: break-all' }, links.map((link, index) => h('.flex-row', [
        h('a', properties(link), link[textKey]),
        index + 1 < links.length ? h('', { style: 'white-space: pre;' }, ', ') : null,
    ])))
    : 'None';

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
        format: (date) => new Date(date).toLocaleString(),
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
        format: (tags) => tags.length > 0 ? tags.map(({ text }) => text).join(', ') : 'None',
    },
    runs: {
        name: 'Runs',
        visible: true,
        format: (runs) => linksContainer(runs, ({ id }) => (
            { href: `?page=run-detail&id=${id}`, onclick: (e) => model.router.handleLinkEvent(e) }
        ), 'runNumber'),
    },
    subsystems: {
        name: 'Subsystems',
        visible: true,
        format: (subsystems) => subsystems.length > 0 ? subsystems.map(({ name }) => name).join(', ') : 'None',
    },
    attachments: {
        name: 'Attachments',
        visible: true,
        format: (attachments) => linksContainer(attachments, ({ id, fileName }) => (
            { href: `/api/attachments/${id}`, download: fileName }
        ), 'originalName'),
    },
});

/**
 * Returns a reply to Log button.
 *
 * @param {Object} model Pass the model to access the defined functions.
 * @param {Object} post all data related to the post
 * @return {vnode} The reply button.
 */
const replyButton = (model, post) => h('a.btn.btn-primary', {
    id: `reply-to-${post.id}`,
    style: 'float: right;',
    onclick: (e) => model.router.handleLinkEvent(e),
    href: `?page=log-create&parentLogId=${post.id}`,
}, 'Reply');

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
                    .map(([key, { name, format, visible }]) => visible && h(`tr#post${index}-${key}`, [
                        h('td.text-right', { style: 'font-weight: bold' }, `${name}:`),
                        h('td', format ? format(post[key]) : post[key]),
                    ]))),
            ]),
        ]),
        h('.w-80.p2.shadow-level1', [
            h('h4', post.title, replyButton(model, post)),
            h(`textarea.w-100#post-content${index}`, {
                oninit: () => {
                    const eventHandler = { location: '', name: '' };
                    const readOnlyProps = { isReadOnly: true, textValue: post.text };
                    model.logs.clearSingleEditor();
                    model.logs.setMarkdownBox(`post-content${index}`, eventHandler, readOnlyProps, true);
                },
            }, post.text),
        ]),
    ]);
};

export default entry;
