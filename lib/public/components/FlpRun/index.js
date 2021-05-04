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
 * @return {vnode} A collection of links separated by commas
 */
const linksContainer = (links, properties, textKey) => links.length > 0
    ? h('.flex-wrap', { style: 'word-break: break-all' }, links.map((link, index) => h('.flex-row', [
        h('a', properties(link), link[textKey]),
        index + 1 < links.length ? h('', { style: 'white-space: pre;' }, ', ') : null,
    ])))
    : 'None';

/**
 * A collection of fields to show per flp detail, optionally with special formatting
 *
 * @param {Object} model Pass the model to access the defined functions.
 * @return {Object} A key-value collection of all relevant fields
 */
const activeFields = (model) => ({
    id: {
        name: 'ID',
        visible: false,
    },
    name: {
        name: 'Name',
        visible: true,
    },
    hostname: {
        name: 'Hostname',
        visible: true,
    },
    nTimeframes: {
        name: '# of Subtimeframes',
        visible: true,
    },
    rootFlpId: {
        name: 'RootFlpId',
        visible: true,
    },
    bytesEquipmentReadOut: {
        name: 'ReadOut in equipment bytes',
        visible: true,
    },
    bytesRecordingReadOut: {
        name: 'ReadOut in recording bytes',
        visible: true,
    },
    bytesFairMQReadOut: {
        name: 'ReadOut in FairMQ bytes',
        visible: true,
    },
    runs: {
        name: 'Runs',
        visible: true,
        format: (runs) => linksContainer(runs, ({ id }) => (
            {
                href: `?page=run-detail&id=${id}`,
                onclick: (e) => model.router.handleLinkEvent(e),
            }
        ), 'runNumber'),
    },
}
);

/**
 * A singular post which is part of a flp
 *
 * @param {Object} model Pass the model to access the defined functions.
 * @param {Object} post all data related to the post
 * @param {Number} index the identification index of the post
 * @param {Boolean} highlight indicator if this post should be highlighted
 * @return {vnode} Returns a post
 */
const entry = (model, post) => {
    const postFields = activeFields(model);

    return h('#Flp', Object.entries(postFields).map(([
        key, {
            name,
            format,
        },
    ]) =>
        h(`.w-30rem.flex-row.justify-between#Flp-${key}`, h('b', `${name}:`), format ? format(post[key]) : post[key])));
};

export default entry;
