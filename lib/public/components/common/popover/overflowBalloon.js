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
import { h, popover, PopoverAnchors } from '/js/src/index.js';

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
    const overflowVertically = Boolean(element) && element.offsetHeight < element.scrollHeight;

    return overflowHorizontally || overflowVertically;
};

/**
 * Return a component containing the given content, with a popover displayed on hover if the content overflow from its parent
 *
 * @param {Component} trigger baloon trigger
 * @param {Component} content baloon content
 * @param {object} [options] a restricted set of popover options
 * @param {boolean} [options.stretch=false] if true, the balloon will be displayed when hovering the element in which this component is displayed
 * @param {function<triggerNode, boolean>} [options.showCondition=(()=>true)] content show condition
 * @param {number} [options.anchor=PopoverAnchors.TOP_MIDDLE] popover anchor
 * @return {Component} the component
 */
export const balloon = (trigger, content, options = null) => {
    const { stretch = false, showCondition = null, anchor = PopoverAnchors.TOP_MIDDLE } = options || {};

    return popover(
        trigger,
        content,
        {
            anchor,
            popoverClass: ['p2'],

            /**
             * Lifecycle method called when the component is changed
             * @param {HTMLElement} previousTriggerNode the previous dom node of the component
             * @param {HTMLElement} newTriggerNode the new dom node of the component
             */
            onTriggerNodeChange: function (previousTriggerNode, newTriggerNode) {
                if (previousTriggerNode) {
                    previousTriggerNode.removeEventListener('mouseover', this.previousNodeMouseoverCallback);
                    previousTriggerNode.removeEventListener('mouseleave', this.hidePopover);
                }

                if (newTriggerNode) {
                    const node = stretch ? newTriggerNode.parentNode : newTriggerNode;
                    const key = newTriggerNode.getAttribute('data-popover-key');

                    const contentNodeMouseoverCallback = () => {
                        node.removeEventListener('mouseleave', this.hidePopover);
                        this.showPopover();
                    };

                    const contentNodeMousleaveCallback = () => {
                        node.addEventListener('mouseleave', this.hidePopover);
                        this.hidePopover();
                    };

                    const newNodeMouseoverCallback = () => {
                        this.showPopover();
                        const selector = `.popover[data-popover-key="${key}"]`;
                        const contentNode = document.querySelector(selector);
                        if (contentNode) {
                            contentNode.removeEventListener('mouseover', contentNodeMouseoverCallback);
                            contentNode.removeEventListener('mouseleave', contentNodeMousleaveCallback);
                            contentNode.addEventListener('mouseover', contentNodeMouseoverCallback);
                            contentNode.addEventListener('mouseleave', contentNodeMousleaveCallback);
                        }
                    };

                    this.previousNodeMouseoverCallback = newNodeMouseoverCallback;

                    node.addEventListener('mouseover', newNodeMouseoverCallback);
                    node.addEventListener('mouseleave', this.hidePopover);
                }
            },

            /**
             * States whether popover is visible
             *
             * @returns {boolean} true if visible, false otherwise
             */
            showCondition: function () {
                return showCondition
                    ? showCondition(this.triggerNode)
                    : true;
            },
        },
    );
};

/**
 * Return a component containing the given content, with a popover displayed on hover if the content overflow from its parent
 *
 * @param {Component} content the content of the component to create
 * @param {object} [options] a restricted set of popover options
 * @param {boolean} [options.stretch=false] if true, the balloon will be displayed when hovering the element in which this component is displayed
 * @return {Component} the component
 */
export const overflowBalloon = (content, options = null) => balloon(
    h('.w-wrapped', content),
    content,
    {
        showCondition: (triggerNode) => doesElementOverflow(triggerNode.querySelector('.w-wrapped')),
        ...options,
    },
);
