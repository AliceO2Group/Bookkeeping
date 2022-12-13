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
import { documentClickTaggedEventRegistry } from '../../../utilities/documentClickTaggedEventRegistry.js';

export const PopoverPreConfiguration = Object.freeze({
    click: Object.freeze({
        // eslint-disable-next-line require-jsdoc
        onTriggerNodeChange: function (previousTriggerNode, newTriggerNode) {
            // eslint-disable-next-line require-jsdoc
            const hideDropdownOnEscape = (e) => e.key === 'Escape' && this.hidePopover();
            // eslint-disable-next-line require-jsdoc
            const handleClick = (e) => {
                documentClickTaggedEventRegistry.tagEvent(e, this.key);
                this.togglePopover();
            };

            if (previousTriggerNode) {
                documentClickTaggedEventRegistry.removeListener(this.hidePopover);
                window.removeEventListener('keyup', hideDropdownOnEscape);
                previousTriggerNode.removeEventListener('click', handleClick);
            }

            if (newTriggerNode) {
                newTriggerNode.addEventListener('click', handleClick);
                documentClickTaggedEventRegistry.addListenerForAnyExceptTagged(this.hidePopover, this.key);
                window.addEventListener('keyup', hideDropdownOnEscape);
            }
        },
        // eslint-disable-next-line require-jsdoc
        onPopoverNodeChange: function (previousPopoverNode, newPopoverNode) {
            // eslint-disable-next-line require-jsdoc
            const handleClick = (e) => documentClickTaggedEventRegistry.tagEvent(e, this.key);

            if (previousPopoverNode) {
                previousPopoverNode.removeEventListener('click', handleClick);
            }

            if (newPopoverNode) {
                newPopoverNode.addEventListener('click', handleClick);
            }
        },
    }),

    /**
     * Partial popover configuration for hover-based popover
     *
     * @type {Readonly<Partial<PopoverConfiguration>>}
     */
    hover: Object.freeze({
        // eslint-disable-next-line require-jsdoc
        onTriggerNodeChange: function (previousTriggerNode, newTriggerNode) {
            if (previousTriggerNode) {
                previousTriggerNode.removeEventListener('mouseenter', this.showPopover);
                previousTriggerNode.removeEventListener('mouseleave', this.hidePopover);
            }

            if (newTriggerNode) {
                newTriggerNode.addEventListener('mouseenter', this.showPopover);
                newTriggerNode.addEventListener('mouseleave', this.hidePopover);
            }
        },
    }),
});
