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
        format: (author) => author.name,
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
 * Returns a Show button.
 *
 * @param {Object} model Pass the model to access the defined functions.
 * @param {Object} post all data related to the post
 * @return {vnode} The reply button.
 */
const showButton = (model, post) => h('a.btn.btn-primary', {
    id: `show-collapse-${post.id}`,
    style: 'float: right; margin-right: 5px',
    onclick: () => {
        model.logs.showPostDetailed(post.id);
    },
}, 'Show');

/**
 * Returns a post text box.
 *
 * @param {Integer} index ID of the Post.
 * @param {Object} model Pass the model to access the defined functions.
 * @param {Object} post contents.
 * @return {vnode} The reply button.
 */
const textBox = (index, model, post) =>
    h(`a#post-id${index}`, {
        style: 'text-decoration: none; color: black',
        onclick: () => {
            model.logs.showPostDetailed(post.id);
        },
    }, h(`.text-ellipsis.w-100#post-content${index}`, post.text));

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
    const postFields = activeFields();

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
        h('.w-80.p2.shadow-level1', h('div.flex-wrap.justify-between.mv1', h('h4', post.title), h('div', [
            replyButton(model, post),
            showButton(model, post),
        ])), textBox(index, model, post)),
    ]);
};

export default entry;
