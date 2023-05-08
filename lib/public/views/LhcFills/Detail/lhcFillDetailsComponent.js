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

import { h, iconWarning } from '/js/src/index.js';
import spinner from '../../../components/common/spinner.js';
import { table } from '../../../components/common/table/table.js';
import errorAlert from '../../../components/common/errorAlert.js';
import { runsActiveColumns } from '../../Runs/ActiveColumns/runsActiveColumns.js';
import { commonLhcFillDisplayConfiguration } from './commonLhcFillDisplayConfiguration.js';
import { detailsGrid } from '../../../components/Detail/detailsGrid.js';
import { formatPercentage } from '../../../utilities/formatting/formatPercentage.js';
import { formatDuration } from '../../../utilities/formatting/formatDuration.mjs';
import { popover } from '../../../components/common/popover/popover.js';
import { formatFileSize } from '../../../utilities/formatting/formatFileSize.js';

/**
 * Define the limit around which one we separate runs in two categories (in minutes)
 * @type {number}
 */
const DURATION_PIVOT = 2;

export const stableBeamStatisticsDisplayConfiguration = [
    {
        efficiency: {
            name: 'Fill Efficiency',
            format: (efficiency) => formatPercentage(efficiency),
        },
        totalCtfFileSize: {
            name: 'Total CTF ',
            format: formatFileSize,
        },
    },
    {
        durationBeforeFirstRun: {
            name: 'Before 1st run',
            format: (duration, lhcFill) => duration ? `${formatDuration(duration)} (${formatPercentage(lhcFill.efficiencyLossAtStart)})` : '-',
        },
        durationAfterLastRun: {
            name: 'After last run',
            format: (duration, lhcFill) => duration ? `${formatDuration(duration)} (${formatPercentage(lhcFill.efficiencyLossAtEnd)})` : '-',
        },
        timeElapsedBetweenRuns: {
            name: 'Total time between runs',
            format: (duration, { runsHasMissingEdges }) => h('.flex-row.g2', [
                formatDuration(duration),
                runsHasMissingEdges ? popover(iconWarning(), 'Some runs have missing start or end') : null,
            ]),
        },
    },
    {
        meanRunDuration: {
            name: 'Mean run duration',
            format: (duration) => formatDuration(duration),
        },
        runsCoverage: {
            name: 'Total runs duration',
            format: (duration) => formatDuration(duration),
        },
    },
];

/**
 * Returns a badge indicating that the given fill is a stable beam if it applies, else returns null
 *
 * @param {Partial<LhcFill>} lhcFill the fill for which badge may be displayed
 * @return {Component|null} the badge if it applies
 */
export const stableBeamBadge = ({ stableBeamsStart, stableBeamsEnd }) => {
    if (!stableBeamsStart) {
        return null;
    }

    return h(
        `#stable-beam-badge.f3.badge.bg-${stableBeamsEnd ? 'primary' : 'success'}.white`,
        `STABLE BEAM${stableBeamsEnd ? '' : ' - ONGOING'}`,
    );
};

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
        const { fillNumber, runs } = lhcFill;

        // Use a limit of 2 minutes as duration separator
        const durationLimit = 1000 * 60 * DURATION_PIVOT;

        return h('', [
            h('.flex-row.items-center.g3', [
                h('h2', `Fill No. ${fillNumber}`),
                stableBeamBadge(lhcFill),
            ]),
            detailsGrid(commonLhcFillDisplayConfiguration.slice(1), lhcFill, 'lhc-fill', '-'),
            h('.flex-row.items-end.mb2.g3', [
                h('h3', 'Statistics'),
                h('ul.nav.nav-tabs.flex-grow', [
                    h('li.nav-item', h(`#physics-runs-tab.nav-link.${detailsModel.limitRunsToPhysics ? 'active' : 'primary'}`, {
                        onclick: () => {
                            detailsModel.limitRunsToPhysics = true;
                        },
                    }, 'PHYSICS')),
                    h('li.nav-item', h(`#all-runs-tab.nav-link.${detailsModel.limitRunsToPhysics ? 'primary' : 'active'}`, {
                        onclick: () => {
                            detailsModel.limitRunsToPhysics = false;
                        },
                    }, 'All')),
                ]),
            ]),
            lhcFill.stableBeamsStart ? detailsGrid(stableBeamStatisticsDisplayConfiguration, lhcFill, 'lhc-fill', '-') : null,
            h('h4', 'Runs'),
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
                            '.flex-row.flex-wrap.gc3.gr1',
                            runsCount.perDetectors.size > 0
                                ? [...runsCount.perDetectors].map(([detector, count]) => h(
                                    `#detector-statistics-${detector}.flex-row.g1`,
                                    [
                                        h('strong.detector-statistics-name', `${detector}:`),
                                        h('.detector-statistics-count', count),
                                        lhcFill.stableBeamsStart
                                            ? h(
                                                '.detector-statistics-efficiency',
                                                `(${formatPercentage(lhcFill.perDetectorsEfficiency.get(detector) || 0)})`,
                                            )
                                            : null,
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
