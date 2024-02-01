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
import { STATUS_ACRONYMS } from '../../domain/enums/statusAcronyms.js';

/**
 * Returns a component displaying a colored environment status
 *
 * @param {string} status The environment status color to display
 * @param {string} content Optional custom content to show in given status color
 *
 * @return {Component} the formatted status
 */
export const coloredEnvironmentStatusComponent = (status, content = status) => {
    if (!(status in STATUS_ACRONYMS)) {
        return null;
    }
    return h('span', { class: statusToCssClassMapping[status] ?? '' }, content);
};

const statusToCssClassMapping = {
    RUNNING: 'success',
    ERROR: 'danger',
    CONFIGURED: 'warning',
};
