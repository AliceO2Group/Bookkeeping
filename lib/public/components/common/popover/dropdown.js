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
import { toggleContainer } from '../toggle/toggleContainer.js';
import { cleanPrefix } from '../../../utilities/cleanPrefix.js';

/**
 * Position the dropdown bellow or above its container and clip it to the viewport
 *
 * @param {HTMLElement} dropdownElement the dropdown element
 * @return {void}
 */
const positionAndClipDropdown = (dropdownElement) => {
    // Clean previous styles
    dropdownElement.style.removeProperty('height');
    dropdownElement.style.removeProperty('bottom');

    // Element to which dropdown must be stick (i.e. the dropdown always visible zone), which is actually the dropdown-container
    const referenceElement = dropdownElement.parentNode.parentNode;

    const referenceBounding = referenceElement.getBoundingClientRect();
    const dropdownBounding = dropdownElement.getBoundingClientRect();
    // Check if the dropdown fit bellow the reference
    if (window.innerHeight - referenceBounding.bottom < dropdownBounding.height) {
        // If not, check if the dropdown fit above the reference
        if (referenceBounding.top >= dropdownBounding.height) {
            dropdownElement.style.setProperty('bottom', `${dropdownBounding.height + referenceBounding.height}px`);
        } else {
            // If not, shrink the dropdown to fit where there is the most space
            const bottomAvailableSpace = window.innerHeight - referenceBounding.bottom;
            const topAvailableSpace = referenceBounding.top;

            if (topAvailableSpace > bottomAvailableSpace) {
                dropdownElement.style.setProperty('height', `${topAvailableSpace}px`);
                dropdownElement.style.setProperty(
                    'bottom',
                    `${referenceBounding.height + dropdownElement.getBoundingClientRect().height}px`,
                );
            } else {
                dropdownElement.style.setProperty('height', `${bottomAvailableSpace}px`);
            }
        }
    }
};

/**
 * Renders a dropdown component
 *
 * @param {ToggleableModel} toggleableModel the model storing the visibility of the dropdown
 * @param {Component} trigger the component triggering the dropdown opening trigger
 * @param {Component} content the content of the dropdown
 * @param {Object} configuration dropdown's configuration
 * @param {string} [configuration.selectorPrefix=''] a selector prefix used to generate DOM selectors
 * @param {"left"|"right"} [configuration.alignment='left'] defines the alignment of the dropdown
 * @return {Component} the dropdown component
 */
export const dropdown = (toggleableModel, trigger, content, configuration) => {
    configuration = configuration || {};
    const selectorPrefix = cleanPrefix(configuration.selectorPrefix);
    const { alignment = 'left' } = configuration;
    return toggleContainer(
        toggleableModel,
        h(
            'div',
            {
                class: [
                    'dropdown-container',
                    selectorPrefix ? `${selectorPrefix}dropdown-container` : null,
                    alignment === 'right' && 'align-right',
                ].filter((clazz) => Boolean(clazz)).join(' '),
            },
            [
                h(
                    '.dropdown-trigger.form-control',
                    [
                        h('.flex-grow', trigger),
                        h('.dropdown-trigger-symbol', ''),
                    ],
                ),
                toggleableModel.isVisible && h(
                    '.dropdown-anchor',
                    h(
                        '.dropdown.bg-white.shadow-level2.br2',
                        {
                            // eslint-disable-next-line require-jsdoc
                            oncreate: function (vnode) {
                                positionAndClipDropdown(vnode.dom);
                            },
                            onupdate: (vnode) => positionAndClipDropdown(vnode.dom),
                        },
                        content,
                    ),
                ),
            ],
        ),
    );
};
