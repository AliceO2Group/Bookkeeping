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
import { badge } from '../common/badge.js';
import { tooltip } from '../common/popover/tooltip.js';
import { QC_SUMMARY_COLORS } from './qcSummaryColors.js';
import { h, iconPlus, info } from '/js/src/index.js';

/**
 * Render QC summary legend tooltip
 * @return {Componenet} qc summary info tooltip
 */
export const qcSummaryLegendTooltip = () => tooltip(info(), h('.flex-column.g3', [
    h('h3', 'QC summary legend'),

    h('.flex-column', [
        h('h4', 'When no QC flag is assigned'),
        h('.flex-row.g3', [
            h('.btn.btn-primary', h('', [iconPlus(), 'QC'])),
            h('', 'redirects to QC flag creation page'),
        ]),
    ]),

    h('.flex-column', [
        h('h4', 'When some QC flag is assigned'),
        h('h5', 'Colors meaning'),
        badge('Whole run is covered by good flag(-s)', { color: QC_SUMMARY_COLORS.ALL_GOOD }),
        badge('A run is partially covered by good flag(-s) and there is no bad flag', { color: QC_SUMMARY_COLORS.PARTIALLY_GOOD_NOT_BAD }),
        badge('A run is partially covered by bad flag(-s)', { color: QC_SUMMARY_COLORS.PARTIALLY_BAD }),
        badge('Whole run is covered by bad flag(-s)', { color: QC_SUMMARY_COLORS.ALL_BAD }),
    ]),

    h('.flex-column', [
        h('h5', 'Percentage'),
        h('span', 'Fraction of a run\'s data which are NOT marked with bad flag'),
    ]),
    h('.flex-column', [
        h('h5', 'Exclamation mark (!)'),
        h('span', 'at least one flag not discarded has not yet been verified'),
        h('span', 'Not discarded flag - one which is not overridden by newer flag'),
    ]),
]));
