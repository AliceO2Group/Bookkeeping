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

import { currentPageAndParameters } from '../../../utilities/currentPageAndParameters.js';
import { h } from '/js/src/index.js';
import { frontLink } from './frontLink.js';

/**
 * Render a front link that leads to a different tab on the same page
 *
 * @param {Component} content the content of the link displayed to the user
 * @param {Object} tabParameters URL parameters identifying the target tab
 * @param {Object} attributes the attributes to apply on the link component
 * @return {vnode} the tab link
 */
export const tabLink = (content, tabParameters, attributes) => {
    const { page, parameters } = currentPageAndParameters();
    let active = true;
    for (const [key, value] of Object.entries(tabParameters)) {
        if (parameters[key] !== value) {
            active = false;
            break;
        }
    }

    if (active) {
        attributes.onclick = () => false;
    }

    return h('li.nav-item', frontLink(
        content,
        page,
        {
            ...parameters,
            ...tabParameters,
        },
        {
            ...attributes,
            class: `${attributes.class} nav-link ${active ? 'active' : ''}`,
        },
    ));
};
