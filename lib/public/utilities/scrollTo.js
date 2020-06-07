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

/**
 * Scroll to the position in the window
 * @param {Number} x The x value
 * @param {Number} y The y value
 * @returns {undefined}
 */
const scrollToPosition = (x, y) => {
    // eslint-disable-next-line no-undef
    window.scrollTo(x, y);
};

/**
 * Scrolls to a particular selector in the document.
 *
 * @param {*} selector A DOMString containing one or more selectors to match.
 * @param {Number} timeout The timeout for the function to execute
 * @returns {undefined}
 */
const scrollTo = (selector, timeout = 0) => {
    // eslint-disable-next-line no-undef
    const element = document.querySelector(selector);
    const x = 0;
    const y = element === null || isNaN(element.offsetTop) ? 0 : element.offsetTop;

    setTimeout(() => {
        scrollToPosition(x, y);
    }, timeout);
};

export default scrollTo;
