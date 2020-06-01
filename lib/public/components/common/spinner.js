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

/**
 * Generic page loading placeholder.
 *
 * @param {number} size The size of the spinner.
 * @return {vnode} The spinner.
 */
const spinner = ({ size = 10, absolute = true } = {}) =>
    h(`.w-100.flex-row.justify-center.items-center${absolute ? '.absolute-fill' : ''}`, [
        h('span.pageLoading', {
            style: `font-size: ${size}em;`,
        }, h('.atom-spinner', h('.spinner-inner', [
            h('.spinner-line'),
            h('.spinner-line'),
            h('.spinner-line'),
            h('.spinner-circle', h('div', '●')),
        ]))),
    ]);

export default spinner;
