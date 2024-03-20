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
import { frontLink } from '../../../components/common/navigation/frontLink.js';
import { dropdown } from '../../../components/common/popover/dropdown.js';
import { iconCaretBottom } from '@aliceo2/web-ui/Frontend/js/src/index.js';
import { h } from '@aliceo2/web-ui/Frontend/js/src/index.js';
import { getInfologgerLinksUrls } from '../../../services/externalRouting/getInfologgerLinksUrls.js';

/**
 * Format the given run's run number
 *
 * @param {Run} the run to format
 * @return {Component} the formatted run number
 */
export const displayRunNumber = ({ environmentId, runNumber }) => {
    const { flp: flpInfologgerLinkUrl, epn: epnInfologgerLinkUrl } = getInfologgerLinksUrls({ environmentId, runNumber });

    return h(
        '.flex-row.items-center.btn-group',
        [
            frontLink(runNumber, 'run-detail', { runNumber }, { class: 'btn btn-primary' }),
            dropdown(
                h('.btn.btn-group-item.last-item', iconCaretBottom()),
                h(
                    '.flex-column.p2.g3',
                    [
                        flpInfologgerLinkUrl && h('a', { href: flpInfologgerLinkUrl }, 'Infologger FLP'),
                        epnInfologgerLinkUrl && h('a', { href: epnInfologgerLinkUrl }, 'Infologger EPN'),
                    ],
                ),
            ),
        ],
    );
};
