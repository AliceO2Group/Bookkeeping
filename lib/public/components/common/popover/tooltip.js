/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */
import { popover } from './popover.js';

/**
 * Wrap a given vnode or string with a popover displaying full content at hoover
 *
 * @param {Component} trigger the element which will display the popover when hovered
 * @param {Component} content the actual content of the popover
 * @return {Component} the resulting trigger and popover
 */
export const tooltip = (trigger, content) => popover(trigger, content, {
    // eslint-disable-next-line require-jsdoc
    onTriggerNodeChange: function (previousTriggerNode, newTriggerNode) {
        if (previousTriggerNode) {
            previousTriggerNode.removeEventListener('mouseover', this.showPopover);
            previousTriggerNode.removeEventListener('mouseout', this.hidePopover);
        }

        if (newTriggerNode) {
            newTriggerNode.addEventListener('mouseover', this.showPopover);
            newTriggerNode.addEventListener('mouseout', this.hidePopover);
        }
    },
});
