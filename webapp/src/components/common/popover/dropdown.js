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

import { h } from '@aliceo2/web-ui-frontend';
import { popover } from './popover.js';
import { PopoverAnchors } from './PopoverEngine.js';
import { PopoverTriggerPreConfiguration } from './popoverPreConfigurations.js';

/**
 * Renders a dropdown component
 *
 * @param {Component} trigger the component triggering the dropdown opening trigger
 * @param {Component} content the content of the dropdown
 * @param {Object} [configuration] dropdown configuration
 * @param {'left'|'right'} [configuration.alignment='left'] defines the alignment of the dropdown
 * @param {popoverVisibilityChangeCallback} [configuration.onVisibilityChange] function called when the visibility changes
 * @return {Component} the dropdown component
 */
export const dropdown = (
    trigger,
    content,
    configuration,
) => {
    configuration = configuration || {};
    const { alignment = 'left' } = configuration;
    return popover(
        trigger,
        h('.dropdown', content),
        {
            ...PopoverTriggerPreConfiguration.click,
            anchor: alignment === 'left' ? PopoverAnchors.BOTTOM_START : PopoverAnchors.BOTTOM_END,
            onVisibilityChange: configuration.onVisibilityChange,
            // Set children size to true because dropdown has an overflow scroll
            setChildrenSize: true,
        },
    );
};
