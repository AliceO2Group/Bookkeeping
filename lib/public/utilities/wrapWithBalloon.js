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
import { clipToViewport } from './clipToViewport.js';

/**
 * Css class to apply in order to enable the balloon (it will be hidden by default)
 * @type {string}
 */
const ENABLED_BALLOON_CLASS = 'enabled';

/**
 * Css class to apply in order to put the balloon on top of the actual content
 * @type {string}
 */
const TOP_POSITION_BALLOON_CLASS = 'anchor-top';

/**
 * Css class applied to the actual content of the balloon
 * @type {string}
 */
const ACTUAL_CONTENT_CLASS = 'balloon-actual-content';

/**
 * The margin applied between the popover border and the window borders
 * @type {number}
 */
const POPOVER_WINDOW_MARGIN = 10;

/**
 * Utility to check if an element's content overflow
 *
 * Method is not perfect because offsetWidth and scrollWidth are rounded and CSS use float values to make the elipsis,
 * the element may actually have an ellipsis but this method return false in limit cases
 *
 * @param {HTMLElement} element the element to look for overflow
 * @returns {boolean} true if the element overflow
 */
const doesElementOverflow = (element) => Boolean(element) && element.offsetWidth < element.scrollWidth;

/**
 * Wrap a given vnode or string with a balloon displaying full content at hoover
 *
 * @param {Vnode} content the content to wrap with a balloon
 * @param {boolean} stretch if true, the balloon activation will be triggered on the container's hover
 * @returns {Vnode} the resulting vnode
 */
export const wrapWithBalloon = (content, stretch = true) => {
    let showBalloon;
    let hideBalloon;
    let eventTrigger;

    return h(`.balloon-container${stretch ? '.stretch' : ''}`, {
        oncreate: (vnode) => {
            const balloonContainer = vnode.dom;

            eventTrigger = stretch ? balloonContainer.parentNode : balloonContainer;

            showBalloon = () => {
                const actualContentElement = balloonContainer.querySelector(`.${ACTUAL_CONTENT_CLASS}`);

                if (doesElementOverflow(actualContentElement)) {
                    const boundingClient = balloonContainer.parentNode.getBoundingClientRect();

                    /*
                     * If the sizer is in the bottom half of the screen, display the balloon on top of the actual element
                     */
                    if (boundingClient.top - boundingClient.height / 2 > window.innerHeight / 2) {
                        balloonContainer.classList.add(TOP_POSITION_BALLOON_CLASS);
                    } else {
                        // Else, display it at the bottom
                        balloonContainer.classList.remove(TOP_POSITION_BALLOON_CLASS);
                    }

                    balloonContainer.classList.add(ENABLED_BALLOON_CLASS);

                    // Check if the balloon will go outside the screen and clip it
                    const balloon = balloonContainer.querySelector('.balloon');
                    clipToViewport(balloon, POPOVER_WINDOW_MARGIN);
                } else {
                    balloonContainer.classList.remove(ENABLED_BALLOON_CLASS);
                }
            };
            hideBalloon = () => balloonContainer.classList.remove(ENABLED_BALLOON_CLASS);

            eventTrigger.addEventListener('mouseover', showBalloon);
            eventTrigger.addEventListener('mouseout', hideBalloon);
        },
        ondestroy: () => {
            if (eventTrigger) {
                eventTrigger.removeEventListener('mouseover', showBalloon);
                eventTrigger.removeEventListener('mouseout', hideBalloon);
            }
        },
    }, h('.balloon-sizer', [
        h(`.${ACTUAL_CONTENT_CLASS}.w-wrapped`, content),
        h('.balloon-anchor.anchor-top', h('.balloon.shadow-level3.p2.br2.bg-white', content)),
    ]));
};
