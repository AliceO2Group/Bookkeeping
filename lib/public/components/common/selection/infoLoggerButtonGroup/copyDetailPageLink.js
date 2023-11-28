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

import { clipboardTarget } from '/components/common/clipboardTarget.js';
import { h } from '/js/src/index.js';

/**
 * Copies a detail page link to the clipboard based on the given parameters
 *
 * @param {string} key the key that specifies what detail page to link to
 * @param {string} value the value that specifies what detail page to link to
 * @param {string} page the page that specifies what detail page to link to
 * @return {clipboardTarget} the copy link component wrapped in a clipboardTarget component
 */
export const copyDetailPageLink = (key, value, page) => {
    const url = `${window.location.origin}/?page=${page}&${key}=${value}`;

    const component = h('a', {
        id: `copy-${value}`,
        style: 'cursor: pointer',
    }, 'Copy Link');

    return clipboardTarget(url, component, () => { });
};
