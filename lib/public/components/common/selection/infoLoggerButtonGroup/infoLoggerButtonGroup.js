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

import { frontLink } from '../../navigation/frontLink.js';
import { dropdown } from '../../popover/dropdown.js';
import { iconCaretBottom } from '/js/src/icons.js';
import { h } from '/js/src/index.js';
import { getInfologgerLink } from '../../../../services/externalRouting/getInfologgerLink.js';
import { CopyToClipboardComponent } from './CopyToClipboardComponent.js';

/**
 * Renders a button group that links to a specific details page based on the given parameters,
 * and a dropdown menu with options to copy the link or access the related infologgers.
 *
 * @param {Object} parameters the parameters that specify what links to display for the details page and the infologgers.
 * @return {Component} the infologger button group component
 */
export const infoLoggerButtonGroup = (parameters) => {
    const { flp: flpInfologger, epn: epnInfologger } = getInfologgerLink(parameters);
    const { environmentId, runNumber } = parameters;
    const key = runNumber ? { runNumber } : { environmentId };
    const value = runNumber || environmentId;
    const page = runNumber ? 'run-detail' : 'env-details';

    return h(
        '.flex-row.items-center.btn-group',
        [
            frontLink(value, page, key, { class: 'btn btn-primary' }),
            dropdown(
                h('.btn.btn-group-item.last-item', iconCaretBottom()),
                h(
                    '.flex-column.p2.g3',
                    [
                        h(CopyToClipboardComponent, { value }, `Copy ${Object.keys(key)[0]}`),
                        flpInfologger && h('a', { href: flpInfologger, target: '_blank' }, 'Infologger FLP'),
                        epnInfologger && h('a', { href: epnInfologger, target: '_blank' }, 'Infologger EPN'),
                    ],
                ),
            ),
        ],
    );
};
