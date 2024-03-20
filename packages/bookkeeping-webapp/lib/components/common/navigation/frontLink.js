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

import { absoluteFrontLink } from './absoluteFrontLink.js';

const PAGE_KEY = 'page';

// eslint-disable-next-line require-jsdoc
const formatParameter = (key, value) => `${key}=${value}`;

/**
 * Return a component representing a link
 *
 * @param {Component} content the content of the link displayed to the user
 * @param {string} page the page to which the link points to
 * @param {Object} [parameters] optionally the list of query parameters, as an object
 * @param {Object} [attributes] optionally the list of attributes to add to the link vnode
 *
 * @return {vnode} the link component
 */
export const frontLink = (content, page, parameters, attributes) => {
    if (!parameters) {
        parameters = {};
    }
    if (!attributes) {
        attributes = {};
    }

    if (PAGE_KEY in parameters) {
        delete parameters[PAGE_KEY];
    }

    const href = `?${[[PAGE_KEY, page], ...Object.entries(parameters)].map(([key, value]) => formatParameter(key, value)).join('&')}`;

    return absoluteFrontLink(content, href, attributes);
};
