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
import spinner from '../../../components/common/spinner.js';
import table from '../../../components/Table/index.js';
import errorAlert from '../../../components/common/errorAlert.js';
import { runsActiveColumns } from '../../Runs/ActiveColumns/runsActiveColumns.js';
import { lhcFillDisplayConfiguration } from './lhcFillDisplayConfiguration.js';
import { detailsGrid } from '../../../components/Detail/detailsGrid.js';
import { extractRunStatistics } from '../../../services/run/extractRunStatistics.js';

/**
 * Define the limit around which one we separate runs in two categories (in minutes)
 * @type {number}
 */
const DURATION_PIVOT = 2;

/**
 * Component displaying information about an LHC fill
 *
 * @param {LhcFillDetailsModel} detailsModel the model of the fill to display
 *
 * @return {vnode} the component representing fill details
 */
export const lhcFillDetailsComponent = (detailsModel) => detailsModel.lhcFill.match({
    NotAsked: () => null,
    Loading: () => spinner(),
    Success: (payload) => {
        const { fillNumber, stableBeamsStart } = payload;
        const { runs } = payload;
        // Use a limit of 2 minutes as duration separator
        const runsStatistics = extractRunStatistics(
            runs,
            1000 * 60 * DURATION_PIVOT,
        );
        return h('', [
            h('.flex-row.items-center.g3', [
                h('h2', `Fill No. ${fillNumber}`),
                stableBeamsStart ? h('#stable-beam-badge.f3.badge.bg-primary.white', 'Stable beam') : null,
            ]),
            // Remove run number from the details grid
            detailsGrid(lhcFillDisplayConfiguration.slice(1), payload, 'lhc-fill', '-'),
            h('h3', 'Runs'),
            h('#statistics.details-container', [
                h('.detail-section', [
                    h('.flex-row.g3', [
                        h('strong', 'Total:'),
                        h('', runsStatistics.total),
                    ]),
                    h('.flex-row.g3', [
                        h('strong', `Over ${DURATION_PIVOT} minutes:`),
                        h('', runsStatistics.overLimit),
                    ]),
                    h('.flex-row.g3', [
                        h('strong', `Under ${DURATION_PIVOT} minutes:`),
                        h('', runsStatistics.underLimit),
                    ]),
                ]),
                h('.detail-section', [
                    h('.flex-column.g1', [
                        h('', 'Per quality'),
                        h(
                            '.flex-row.g3',
                            runsStatistics.perQuality.size > 0
                                ? [...runsStatistics.perQuality].map(([quality, count]) => h('.flex-row.g1', [
                                    h('strong', `${quality}:`),
                                    h('', count),
                                ]))
                                : '-',
                        ),
                    ]),
                    h('.sph2.flex-column.g1', [
                        h('', 'Per detectors'),
                        h(
                            '.flex-row.g3',
                            runsStatistics.perDetectors.size > 0
                                ? [...runsStatistics.perDetectors].map(([detector, count]) => h('.flex-row.g1', [
                                    h('strong', `${detector}:`),
                                    h('', count),
                                ]))
                                : '-',
                        ),
                    ]),
                ]),
            ]),
            h('#runs', table(runs, runsActiveColumns)),
        ]);
    },
    Failure: (errors) => errorAlert(errors),
});
