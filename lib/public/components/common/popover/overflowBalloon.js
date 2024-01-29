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
import { popover } from './popover.js';
import { h } from '/js/src/index.js';
import { PopoverAnchors } from './PopoverEngine.js';

/**
 * Utility to check if an element's content overflow
 *
 * Method is not perfect because offsetWidth and scrollWidth are rounded and CSS use float values to make the ellipsis,
 * the element may actually have an ellipsis but this method return false in limit cases
 *
 * @param {HTMLElement} element the element to look for overflow
 * @returns {boolean} true if the element overflow
 */
const doesElementOverflow = (element) => {
    const overflowHorizontally = Boolean(element) && element.offsetWidth < element.scrollWidth;
    const overvlowVertically = Boolean(element) && element.offsetHeight < element.scrollHeight;

    return overflowHorizontally || overvlowVertically;
};

/**
 * Return a component containing the given content, with a popover displayed on hover if the content overflow from its parent
 *
 * @param {Component} content the content of the component to create
 * @param {Object|null} [options=null] a restricted set of popover options
 * @param {boolean} [options.stretch=false] if true, the balloon will be displayed when hovering the element in which this component is displayed
 * @return {vnode} the component
 */
export const overflowBalloon = (content, options = null) => {
    const { stretch = false } = options || {};

    return popover(
        h('.w-wrapped', content),
        content,
        {
            anchor: PopoverAnchors.TOP_MIDDLE,
            popoverClass: ['no-events', 'p2'],
            // eslint-disable-next-line require-jsdoc
            onTriggerNodeChange: function (previousTriggerNode, newTriggerNode) {
                if (previousTriggerNode) {
                    const node = stretch ? previousTriggerNode.parentNode : previousTriggerNode;

                    node.removeEventListener('mouseenter', this.showPopover);
                    node.removeEventListener('mouseleave', this.hidePopover);
                }

                if (newTriggerNode) {
                    const node = stretch ? newTriggerNode.parentNode : newTriggerNode;

                    node.addEventListener('mouseenter', this.showPopover);
                    node.addEventListener('mouseleave', this.hidePopover);
                }
            },
            // eslint-disable-next-line require-jsdoc
            showCondition: function () {
                return doesElementOverflow(this.triggerNode.querySelector('.w-wrapped'));
            },
        },
    );
};
