/**
 * @license
 * Copyright 2019-2020 CERN and copyright holders of ALICE O2.
 * See http://alice-o2.web.cern.ch/copyright for details of the copyright holders.
 * All rights not expressly granted are reserved.
 *
 * This software is distributed under the terms of the GNU General Public
 * License v3 (GPL Version 3), copied verbatim in the file "COPYING".
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

import { h } from '/js/src/index.js';

/**
 * A tooltip functionality for elements.
 *
 * @param {String | Vnode} content the content within the tooltip.
 * @param {Boolean} hasParent when true the parent is selected for the onAction function.
 * @param {('bottom' | 'top' | 'left' | 'right')} position the position of the tooltip.
 * @param {Array} addtionalAttributes An array of attributes to change the tooltip to a preferred liking.
 * @returns {Vnode} A vnode with the tooltip attached
 */
export const tooltip = (content, hasParent = true, position = 'bottom', addtionalAttributes = []) =>{
    let show;
    let hide;
    let eventTrigger;
    return h('span.textblock', {
        oncreate: (vnode) => {
            const container = vnode.dom;

            eventTrigger = hasParent ? container.parentNode : container;

            show = () => {
                container.style.visibility = 'visible';
            };
            hide = () => {
                container.style.visibility = 'hidden';
            };

            eventTrigger.addEventListener('mouseover', show);
            eventTrigger.addEventListener('mouseout', hide);
        },
        onDestroy: () => {
            eventTrigger.addEventListener('mouseover', show);
            eventTrigger.addEventListener('mouseout', hide);
        },
        ...addtionalAttributes,
    }, h(`span.textblock-text.${position}`, content));
};
