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

export const Color = {
    BLACK: 'var(--color-black)',
    GRAY_DARKER: 'var(--color-gray-darker)',
    GRAY_DARK: 'var(--color-gray-dark)',
    GRAY: 'var(--color-gray)',
    GRAY_LIGHT: 'var(--color-gray-light)',
    GRAY_LIGHTER: 'var(--color-gray-lighter)',
    WHITE: 'var(--color-white)',

    RED: 'var(--color-red)',
    SOFT_RED: 'var(--color-soft-red)',
    ORANGE: 'var(--color-orange)',
    DARK_BLUE: 'var(--color-dark-blue)',
    BLUE: 'var(--color-blue)',
    LIGHT_BLUE: 'var(--color-light-blue)',
    GREEN: 'var(--color-green)',

    PRIMARY: 'var(--color-primary)',
    PRIMARY_DARK: 'var(--color-primary-dark)',
    WARNING: 'var(--color-warning)',
    WARNING_DARKER: 'var(--color-warning-darker)',
    DANGER: 'var(--color-danger)',
    DANGER_DARK: 'var(--color-danger-dark)',
    SUCCESS: 'var(--color-success)',
    SUCCESS_DARK: 'var(--color-success-dark)',
    GLOBAL_RUN: 'var(--color-light-blue)',
};

/**
 * Return true if the contrast color of the given color is black instead of white
 *
 * Based on https://stackoverflow.com/a/3943023/9820018
 *
 * @param {string} color the color to look for contrast
 *  in hex RGB `#xxxxxx`
 *  or as CSS variable enclosed by var function `var(--variable-name)`
 * @return {boolean} true if the contrast is black, false if it is white
 */
export const isContrastBlack = (color) => {
    color = /var\(.+\)/.test(color) ? getValueFromCssVar(color.slice(4, -1)) : color;

    const red = parseInt(color.slice(1, 3), 16);
    const green = parseInt(color.slice(3, 5), 16);
    const blue = parseInt(color.slice(5, 7), 16);
    return red * 0.299 + green * 0.587 + blue * 0.114 > 186;
};

/**
 * Get value of CSS variable
 *
 * @param {string} variableName variable name
 * @return {string} value
 */
export const getValueFromCssVar = (variableName) => getComputedStyle(document.documentElement).getPropertyValue(variableName);

/**
 * Return black or white for given color
 *
 * @param {string} color the color to look for contrast
 *  in hex RGB `#xxxxxx`
 *  or as CSS variable enclosed by var function `var(--variable-name)`
 * @return {'black'|'white'} contrast color
 */
export const getContrastColor = (color) => isContrastBlack(color) ? 'black' : 'white';
