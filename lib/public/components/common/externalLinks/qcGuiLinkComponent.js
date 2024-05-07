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

import { getRunQcGuiLinkUrl } from '../../../services/externalRouting/getRunQcGuiLinkUrl.js';
import { h } from '/js/src/index.js';

/**
 * Display a QC GUI link
 *
 * @param {Run} run the run to which QC GUI link should relate to
 * @return {Component} the QC GUI link
 */
export const qcGuiLinkComponent = (run) => {
    const qcGuiLinkUrl = getRunQcGuiLinkUrl(run);

    if (!qcGuiLinkUrl) {
        return null;
    }

    return h('a', { href: qcGuiLinkUrl, target: '_blank' }, 'QCG');
};
