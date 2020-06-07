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

const ACTIVE_FIELDS = {
    id: {
        name: 'ID',
        visible: true,
    },
    authorId: {
        name: 'Source',
        visible: true,
    },
    creationTime: {
        name: 'Created',
        visible: true,
        format: (date) => new Date(date).toLocaleString(),
    },
    subsystems: {
        name: 'Subsystems',
        visible: true,
    },
    origin: {
        name: 'Class',
        visible: true,
    },
    subtype: {
        name: 'Type',
        visible: true,
    },
    run: {
        name: 'Run',
        visible: true,
    },
};

/**
 * Returns a reply to Log button.
 *
 * @param {*} model Pass the model to access the defined functions.
 * @param {Object} post all data related to the post
 * @return {vnode} The reply button.
 */
const replyButton = (model, post) => h('a.btn.btn-primary', {
    id: `reply-to-${post.id}`,
    style: {
        float: 'right',
    },
    onclick: (e) => model.router.handleLinkEvent(e),
    href: `?page=create-log-entry&parentLogId=${post.id}`,
}, 'Reply');

/**
 * A singular post which is part of a log
 *
 * @param {*} model Pass the model to access the defined functions.
 * @param {Object} post all data related to the post
 * @param {Number} index the identification index of the post
 * @param {Boolean} highlight indicator if this post should be highlighted
 * @return {vnode} Returns a post
 */
const entry = (model, post, index, highlight) =>
    h(`.w-100.flex-row.shadow-level1${highlight ? '.bg-gray-light' : ''}`, {
        id: `post${index}`,
        style: {
            margin: '5px',
        },
    }, [
        h('.w-20.shadow-level', { style: { padding: '10px' } }, [
            h('table', [
                h('tbody', Object.entries(ACTIVE_FIELDS).map(([key, { name, format, visible }]) => visible && h('tr', [
                    h('td', { style: { 'text-align': 'right', 'font-weight': 'bold' } }, `${name}:`),
                    h('td', post[key] ? format ? format(post[key]) : post[key] : 'None'),
                ]))),
            ]),
        ]),
        h('.w-80.shadow-level1', { style: { padding: '10px' } }, [
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

export default entry;
