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
 * Removes an element by selector from the DOM.
 *
 * @param {*} selector A DOMString containing one or more selectors to match.
 * @returns {undefined}
 */
const removeElement = (selector) => {
    // eslint-disable-next-line no-undef
    const element = document.querySelector(selector);
    if (element === null) {
        // No need to remove something that doesn't exists
        return;
    }

    element.parentNode.removeChild(element);
};

export { removeElement };
