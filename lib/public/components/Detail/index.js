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
 * A singular detail page where fields can be given to to create a page.
 *
 * @param {Object} postFields all the data fields that need to be shown.
 * @param {Object} post all data related to the post
 * @param {String} selectorName the name for the block selector
 * @return {vnode} Returns a post
 */
const format = (postFields, post, selectorName) => h(`#${selectorName}`, Object.entries(postFields).map(([
    key, {
        name,
        format,
    },
]) =>
    h(`.flex-row.justify-between#Flp-${key}`, h('b', `${name}:`), format ? format(post[key]) : post[key])));
export default format;
