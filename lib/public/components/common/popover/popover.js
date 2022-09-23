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
import { clipToViewport } from '../../../utilities/clipToViewport.js';

/**
 * Css class to apply in order to display the popover (it will be hidden by default)
 * @type {string}
 */
const ENABLED_POPOVER_CLASS = 'enabled';

const CONTAINER_CLASS = 'popover-container';

/**
 * Css class applied to the actual content of the popover
 * @type {string}
 */
const ACTUAL_CONTENT_CLASS = 'popover-actual-content';

/**
 * Css class applied to the popover anchor
 * @type {string}
 */
const ANCHOR_CLASS = 'popover-anchor';

/**
 * Css class to apply in order to put the popover on top of the actual content
 * @type {string}
 */
const TOP_POSITION_POPOVER_CLASS = 'anchor-top';

/**
 * The margin applied between the popover border and the window borders
 * @type {number}
 */
const POPOVER_WINDOW_MARGIN = 10;

/**
 * Utility to check if an element's content overflow
 *
 * Method is not perfect because offsetWidth and scrollWidth are rounded and CSS use float values to make the ellipsis,
 * the element may actually have an ellipsis but this method return false in limit cases
 *
 * @param {HTMLElement} element the element to look for overflow
 * @returns {boolean} true if the element overflow
 */
const doesElementOverflow = (element) => Boolean(element) && element.offsetWidth < element.scrollWidth;

/**
 * Show the popover contained in the given popover container
 *
 * @param {HTMLElement} popoverContainer the element containing the popover to display
 * @return {void}
 */
const showPopover = (popoverContainer) => {
    const popoverAnchor = popoverContainer.querySelector(`.${ANCHOR_CLASS}`);

    const boundingClient = popoverContainer.parentNode.getBoundingClientRect();

    // If the sizer is in the bottom half of the screen, display the popover on top of the actual element
    if (boundingClient.top + boundingClient.height / 2 > window.innerHeight / 2) {
        popoverAnchor.classList.add(TOP_POSITION_POPOVER_CLASS);
    } else {
        // Else, display it at the bottom
        popoverAnchor.classList.remove(TOP_POSITION_POPOVER_CLASS);
    }

    popoverContainer.classList.add(ENABLED_POPOVER_CLASS);

    // Check if the popover will go outside the screen and clip it
    const popoverElement = popoverContainer.querySelector('.popover');
    clipToViewport(popoverElement, POPOVER_WINDOW_MARGIN);
};

/**
 * Hide the popover contained in the given popover container
 *
 * @param {HTMLElement} popoverContainer the element containing the popover to hide
 * @return {void}
 */
const hidePopover = (popoverContainer) => popoverContainer.classList.remove(ENABLED_POPOVER_CLASS);

/**
 * Wrap a given vnode or string with a popover displaying full content at hoover
 *
 * @param {vnode|string|Array} trigger the element which will display the popover when hovered
 * @param {vnode|string|Array} content the actual content of the popover
 * @param {Object|null} [options=null] eventual popover options
 * @param {boolean} [options.stretch=false] if true, the popover activation will be triggered on the parent of the popover trigger, else it will
 *     be triggered on the trigger itself
 * @param {boolean} [options.overflowOnly=false] if true, the popover will be shown only if the actual content overflows from its parent
 * @returns {vnode} the resulting vnode
 */
export const popover = (trigger, content, options = null) => {
    const { stretch = false, overflowOnly = false } = options || {};

    let showPopoverHandler;
    let hidePopoverHandler;
    let eventTrigger;

    return h(`.${CONTAINER_CLASS}${stretch ? '.stretch' : ''}`, {
        oncreate: (vnode) => {
            const popoverContainer = vnode.dom;

            eventTrigger = stretch ? popoverContainer.parentNode : popoverContainer;

            const actualContentElement = popoverContainer.querySelector(`.${ACTUAL_CONTENT_CLASS}`);

            showPopoverHandler = () => {
                if (!overflowOnly || doesElementOverflow(actualContentElement)) {
                    showPopover(popoverContainer);
                }
            };
            hidePopoverHandler = () => hidePopover(popoverContainer);

            eventTrigger.addEventListener('mouseover', showPopoverHandler);
            eventTrigger.addEventListener('mouseout', hidePopoverHandler);
        },
        ondestroy: () => {
            if (eventTrigger) {
                eventTrigger.removeEventListener('mouseover', showPopoverHandler);
                eventTrigger.removeEventListener('mouseout', hidePopoverHandler);
            }
        },
    }, h('.popover-sizer', [
        h(`.${ACTUAL_CONTENT_CLASS}.w-wrapped`, trigger),
        h('.popover-anchor.anchor-top', h('.popover.shadow-level3.p2.br2.bg-white', content)),
    ]));
};
