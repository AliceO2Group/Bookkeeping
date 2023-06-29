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

import { h, info } from '/js/src/index.js';

/**
 * Wrap a given content as a contextual info
 *
 * @param {Component} content the content of the contextual info
 * @return {vnode} the resulting component
 */
export const contextualInfo = (content) => h(
    '.ph2.pv1.flex-row.g2.items-center',
    [
        h('.contextual-message-icon.br-pill.b-primary.flex-row.items-center.justify-center', info()),
        h('.gray-darker', content),
    ],
);
