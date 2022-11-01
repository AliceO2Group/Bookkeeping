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
import { notifyFrontLinkListeners } from './frontLinkListener.js';

/**
 * Return a component representing a link
 *
 * @param {Component} content the content of the link displayed to the user
 * @param {string} href the absolute URL targeted by the link
 * @param {Object} [attributes] optionally the list of attributes to add to the link vnode
 *
 * @return {vnode} the link component
 */
export const absoluteFrontLink = (content, href, attributes) => {
    const onclick = Object.hasOwnProperty.call(attributes ?? {}, 'onclick')
        ? (e) => attributes.onclick(e) !== false && notifyFrontLinkListeners(e)
        : notifyFrontLinkListeners;

    return h('a', {
        ...attributes,
        href,
        onclick,
    }, content);
};
