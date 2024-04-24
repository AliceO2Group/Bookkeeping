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

import { h } from '/js/src/index.js';

/**
 * Return true if the contrast color of the given color is black instead of white
 *
 * Based on https://stackoverflow.com/a/3943023/9820018
 *
 * @param {string} color the color to look for contrast, in hexa RGB
 * @return {boolean} true if the contrast is black, false if it is white
 */
const isContrastBlack = (color) => {
    const red = parseInt(color.slice(1, 3), 16);
    const green = parseInt(color.slice(3, 5), 16);
    const blue = parseInt(color.slice(5, 7), 16);
    return red * 0.299 + green * 0.587 + blue * 0.114 > 186;
};

/**
 * Display text badge
 *
 * @param {Component} label the label of the badge
 * @param {object} [configuration] optional configuration
 * @param {string|null} [configuration.color] the color of the badge, default to light gray
 * @param {boolean} [configuration.small] if true, the badge will be smaller than normal text
 * @param {boolean} [configuration.outline] if true, the badge will have no background but a colored border
 * @return {Component} the badge
 */
export const badge = (label, configuration) => {
    const { color: rawColor, small, outline } = configuration || {};

    const classNames = ['badge', 'b1'];
    const style = {};
    if (!rawColor) {
        classNames.push('b-gray-light');
        if (!outline) {
            classNames.push('bg-gray-light');
        }
    } else {
        const color = rawColor.length === 6 ? `#${rawColor}` : rawColor;
        style.borderColor = color;
        if (outline) {
            style.color = 'black';
            style.backgroundColor = 'white';
        } else {
            style.backgroundColor = color;
            style.color = isContrastBlack(color) ? 'black' : 'white';
        }
    }

    const attributes = {
        class: classNames.filter((className) => className).join(' '),
        style,
    };

    return h(small ? 'small' : 'span', attributes, label);
};
