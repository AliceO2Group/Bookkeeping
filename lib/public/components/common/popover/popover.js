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
import { createPortal } from '../../../utilities/createPortal.js';
import { getUniqueId } from '../../../utilities/getUniqueId.js';
import { createPopoverEngine } from './PopoverEngine.js';

/**
 * @callback onPopoverTriggerNodeChange Function called when the trigger node change bound to the popover component instance
 *
 * @this PopoverComponent
 *
 * @param {HTMLElement|null} previousTriggerNode the previous trigger node if it exists (null if the node is created)
 * @param {HTMLElement|null} newTriggerNode the new trigger node if it exists (null if the node is removed)
 * @return {void}
 */

/**
 * @callback popoverShowConditionCallback Function called before displaying the popover to eventually prevent the display
 *
 * @this PopoverComponent
 *
 * @return {boolean} if false, popover will not be displayed
 */

/**
 * @typedef PopoverConfiguration the configuration of the popover
 *
 * @property {PopoverAnchor} anchor the anchor of the popover
 * @property {onPopoverTriggerNodeChange} onTriggerNodeChange function called when the trigger DOM node changes
 * @property {popoverShowConditionCallback} [showCondition] function called before showing the popover
 * @property {string[]|string} [popoverClass] css classes to apply to the popover (in addition to the default ones)
 */

/**
 * Component to display a popover triggered on specific actions
 */
class PopoverComponent {
    /**
     * Constructor
     *
     * @param {Component} trigger the trigger component
     * @param {Component} content the popover component
     * @param {PopoverConfiguration} configuration the popover options
     */
    constructor({ attrs: { trigger, content, configuration } }) {
        this._triggerComponent = trigger;
        this._contentCompoenent = content;

        this._isVisible = false;

        /** @type {HTMLElement|null} */
        this._popoverNode = null;

        /** @type {HTMLElement|null} */
        this._triggerNode = null;

        this.showPopover = this.showPopover.bind(this);
        this.hidePopover = this.hidePopover.bind(this);
        this.togglePopover = this.togglePopover.bind(this);

        const { anchor, onTriggerNodeChange, showCondition, popoverClass = [] } = configuration;
        this._anchor = anchor;
        this._onTriggerNodeChange = onTriggerNodeChange.bind(this);
        this._showCondition = showCondition ? showCondition.bind(this) : () => true;
        this._popoverClasses = Array.isArray(popoverClass) ? popoverClass : [popoverClass];

        this._popoverKey = getUniqueId();
    }

    /**
     * Update the popover's node visibility and position
     *
     * @return {void}
     */
    updatePopover() {
        if (this._popoverNode === null || this._triggerNode === null) {
            return;
        }

        if (this._isVisible) {
            this._popoverNode.style.display = 'flex';

            const engine = createPopoverEngine(
                this._triggerNode,
                this._popoverNode,
                {
                    width: window.innerWidth,
                    height: window.innerHeight,
                    left: 0,
                    top: 0,
                },
                this._anchor,
            );
            engine.reset();
            engine.fitAndPosition();
        } else {
            this._popoverNode.style.display = 'none';
        }
    }

    /**
     * Sets the visibility of the popover
     *
     * @param {boolean} visibility the visibility to set
     * @return {void}
     */
    setVisibility(visibility) {
        this._isVisible = visibility;
        this.updatePopover();
    }

    /**
     * Toggle the visibility of the popover
     *
     * @return {void}
     */
    togglePopover() {
        this.setVisibility(!this._isVisible);
    }

    /**
     * Shows the popover
     *
     * @return {void}
     */
    showPopover() {
        this.setVisibility(this._showCondition());
    }

    /**
     * Hides the popover
     *
     * @return {void}
     */
    hidePopover() {
        this.setVisibility(false);
    }

    /**
     * Set the trigger node
     *
     * @param {HTMLElement} node the new trigger element
     * @return {void}
     */
    setTriggerNode(node) {
        if (this._triggerNode !== node) {
            this._onTriggerNodeChange(this._triggerNode, node);
            this._triggerNode = node;
        }
    }

    /**
     * Returns the current trigger node
     *
     * @return {HTMLElement} the trigger node
     */
    get triggerNode() {
        return this._triggerNode;
    }

    /**
     * Renders the component
     *
     * @return {Component} the popover component
     */
    view() {
        return [
            h('.popover-trigger', {
                ['data-popover-key']: this._popoverKey,
                oncreate: ({ dom }) => {
                    this.setTriggerNode(dom);
                },
                onupdate: ({ dom }) => {
                    this.setTriggerNode(dom);
                },
                onremove: () => {
                    this.setTriggerNode(null);
                },
            }, this._triggerComponent),
            createPortal(h('', {
                class: ['popover', 'shadow-level3', 'p2', 'br2', 'bg-white', ...this._popoverClasses].join(' '),
                ['data-popover-key']: this._popoverKey,
                oncreate: ({ dom }) => {
                    this._popoverNode = dom;
                    this.updatePopover();
                },
                onupdate: ({ dom }) => {
                    this._popoverNode = dom;
                    this.updatePopover();
                },
                onremove: () => {
                    this._popoverNode = null;
                },
            }, this._contentCompoenent)),
        ];
    }
}

/**
 * Display a popover and its trigger (trigger is always displayed)
 *
 * @param {Component} trigger the element which will display the popover when hovered
 * @param {Component} content the actual content of the popover
 * @param {PopoverConfiguration} configuration the popover configuration
 * @returns {Component} the resulting trigger and popover
 */
export const popover = (trigger, content, configuration) => h(PopoverComponent, { trigger, content, configuration });
