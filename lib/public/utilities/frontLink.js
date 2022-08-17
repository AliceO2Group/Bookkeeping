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

const frontLinkListeners = [];

/**
 * Register a function to be called any time one of the frontLink is triggered (the navigation event will be passed as parameter)
 *
 * @param {callback} listener the listener to register
 *
 * @return {void}
 */
export const registerFrontLinkListener = (listener) => {
    frontLinkListeners.push(listener);
};

// eslint-disable-next-line require-jsdoc
const formatParameter = (key, value) => `${key}=${value}`;

/**
 * Return a component representing a link
 *
 * @param {string|vnode|Array} content the text of the link displayed to the user
 * @param {Object} page the page to which the link points to
 * @param {Object} [parameters] optionally the list of query parameters, as an object
 * @param {Object} [attributes] optionally the list of attributes to add to the link vnode
 *
 * @return {vnode} the link component
 */
export const frontLink = (content, page, parameters, attributes) => {
    parameters = {
        ...parameters,
        page,
    };
    const href = `?${Object.entries(parameters).map(([key, value]) => formatParameter(key, value)).join('&')}`;

    /**
     * Onclick handler to call on any link
     *
     * @param {Event} e the click event
     *
     * @return {void}
     */
    const baseOnclick = (e) => {
        for (const listener of frontLinkListeners) {
            listener(e);
        }
    };

    const onclick = Object.hasOwnProperty.call(attributes ?? {}, 'onclick') ? (e) => {
        attributes.onclick(e);
        baseOnclick(e);
    } : baseOnclick;

    return h('a', {
        ...attributes,
        href,
        onclick,
    }, content);
};
