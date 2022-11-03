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

import { taggedEventRegistry } from '../../../utilities/taggedEventRegistry.js';
import { h } from '/js/src/index.js';

/**
 * Display an element that contains a toggleable element, and toggle this element on click
 *
 * @param {ToggleableModel} toggleModel the model storing the state of the toggle content
 * @param {Component} content the content of the toggle container (including toggle trigger and toggleable content)
 * @param {Object} [attributes] eventually mithril attributes to add to the component
 * @return {Component} the container
 */
export const toggleContainer = (toggleModel, content, attributes) => {
    attributes = attributes || {};
    return h(
        '',
        {
            ...attributes,
            // eslint-disable-next-line require-jsdoc
            oncreate: function () {
                if (typeof attributes.oncreate === 'function') {
                    attributes.oncreate();
                }

                this.hideToggleable = () => toggleModel.hide();
                taggedEventRegistry.addListenerForAnyExceptTagged(this.hideToggleable, toggleModel.closeEventTag);

                this.hideDropdownOnEscape = (e) => e.key === 'Escape' && toggleModel.hide();
                window.addEventListener('keyup', this.hideDropdownOnEscape);
            },
            // eslint-disable-next-line require-jsdoc
            onremove: function () {
                if (typeof attributes.onremove === 'function') {
                    attributes.onremove();
                }

                taggedEventRegistry.removeListener(this.hideToggleable);
                window.removeEventListener('keyup', this.hideDropdownOnEscape);
            },
            onclick: (e) => {
                if (typeof attributes.onclick === 'function') {
                    attributes.onclick();
                }

                taggedEventRegistry.tagEvent(e, toggleModel.closeEventTag);
                if (!toggleModel.isVisible) {
                    toggleModel.show();
                }
            },
        },
        content,
    );
};
