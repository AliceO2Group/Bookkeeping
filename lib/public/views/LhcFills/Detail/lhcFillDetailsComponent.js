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
import { table } from '../../../components/common/table/table.js';
import errorAlert from '../../../components/common/errorAlert.js';
import { runsActiveColumns } from '../../Runs/ActiveColumns/runsActiveColumns.js';
import { lhcFillDisplayConfiguration } from './lhcFillDisplayConfiguration.js';
import { detailsGrid } from '../../../components/Detail/detailsGrid.js';

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
export const lhcFillDetailsComponent = (detailsModel) => detailsModel.lhcFillDetails.match({
    NotAsked: () => null,
    Loading: () => spinner(),
    Success: (lhcFillDetails) => {
        const { lhcFill, runsCount } = lhcFillDetails;
        const { fillNumber, stableBeamsStart, runs } = lhcFill;

        // Use a limit of 2 minutes as duration separator
        const durationLimit = 1000 * 60 * DURATION_PIVOT;

        return h('', [
            h('.flex-row.items-center.g3', [
                h('h2', `Fill No. ${fillNumber}`),
                stableBeamsStart ? h('#stable-beam-badge.f3.badge.bg-primary.white', 'Stable beam') : null,
            ]),
            // Remove run number from the details grid
            detailsGrid(lhcFillDisplayConfiguration.slice(1), lhcFill, 'lhc-fill', '-'),
            h('h3', 'Runs'),
            runsCount && h('#statistics.details-container', [
                h('.detail-section', [
                    h('.flex-row.g3', [
                        h('strong', 'Total:'),
                        h('', runsCount.total),
                    ]),
                    h('.flex-row.g3', [
                        h('strong', `Over ${DURATION_PIVOT} minutes:`),
                        h('', runsCount.overLimit(durationLimit)),
                    ]),
                    h('.flex-row.g3', [
                        h('strong', `Under ${DURATION_PIVOT} minutes:`),
                        h('', runsCount.underLimit(durationLimit)),
                    ]),
                ]),
                h('.detail-section', [
                    h('.flex-column.g1', [
                        h('', 'Per quality'),
                        h(
                            '.flex-row.g3',
                            runsCount.perQuality.size > 0
                                ? [...runsCount.perQuality].map(([quality, count]) => h('.flex-row.g1', [
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
                            runsCount.perDetectors.size > 0
                                ? [...runsCount.perDetectors].map(([detector, count]) => h(
                                    `#detector-statistics-${detector}.flex-row.g1`,
                                    [
                                        h('strong.detector-statistics-name', `${detector}:`),
                                        h('.detector-statistics-count', count),
                                        h(
                                            '.detector-statistics-efficiency',
                                            `(${lhcFill.perDetectorsEfficiency.get(detector) || '0'}%)`,
                                        ),
                                    ],
                                ))
                                : '-',
                        ),
                    ]),
                ]),
            ]),
            h('#runs', table(runs, runsActiveColumns, null, { profile: 'lhcFill' })),
        ]);
    },
    Failure: (errors) => errorAlert(errors),
});
