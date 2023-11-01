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
import { getInfologgerLink } from '../../../services/externalRouting/getInfologgerLink.js';

/**
 * Display links to infologger for the given environment's
 *
 * @param {Environment} environment the environment for which links need to be displayed
 * @return {vnode} the infologger links
 */
export const displayEnvironmentInfologgerLinks = ({ id }) => {
    const { flp, epn } = getInfologgerLink({ environmentId: id });

    return h(
        '.flex-row.btn-group',
        [
            flp && h('a.btn', { href: flp }, 'FLP'),
            epn && h('a.btn', { href: epn }, 'EPN'),
        ],
    );
};
