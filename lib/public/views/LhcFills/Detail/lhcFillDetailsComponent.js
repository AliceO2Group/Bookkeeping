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
import { activeColumnsTable } from '../../../components/common/activeColumnsTable/activeColumnsTable.js';
import errorAlert from '../../../components/common/errorAlert.js';
import { runsActiveColumns } from '../../Runs/ActiveColumns/runsActiveColumns.js';
import { commonLhcFillDisplayConfiguration } from './commonLhcFillDisplayConfiguration.js';
import { detailsGrid } from '../../../components/Detail/detailsGrid.js';
import { formatPercentage } from '../../../utilities/formatting/formatPercentage.js';
import { formatDuration } from '../../../utilities/formatting/formatDuration.mjs';
import { formatFileSize } from '../../../utilities/formatting/formatFileSize.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';
import { tabbedPanelComponent } from '../../../components/TabbedPanel/tabbedPanelComponent.js';
import { LHC_FILL_DETAILS_PANELS_KEYS } from './LhcFillDetailsModel.js';
import { logsActiveColumns } from '../../Logs/ActiveColumns/logsActiveColumns.js';
import { tooltip } from '../../../components/common/popover/tooltip.js';

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
            name: 'Total CTF size',
            format: formatFileSize,
        },
        totalTfFileSize: {
            name: 'Total TF size',
            format: formatFileSize,
        },
    },
    {
        timeLossAtStart: {
            name: 'Before 1st run',
            format: (duration, lhcFill) => duration ? `${formatDuration(duration)} (${formatPercentage(lhcFill.efficiencyLossAtStart)})` : '-',
        },
        timeLossAtEnd: {
            name: 'After last run',
            format: (duration, lhcFill) => duration ? `${formatDuration(duration)} (${formatPercentage(lhcFill.efficiencyLossAtEnd)})` : '-',
        },
        timeElapsedBetweenRuns: {
            name: 'Total time between runs',
            format: (duration, { runsHasMissingEdges }) => h('.flex-row.g2', [
                formatDuration(duration),
                runsHasMissingEdges ? tooltip(iconWarning(), 'Some runs have missing start or end') : null,
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
    Success: (lhcFill) => {
        const { fillNumber } = lhcFill;

        // Use a limit of 2 minutes as duration separator
        const durationLimit = 1000 * 60 * DURATION_PIVOT;

        return h('', [
            h('.flex-row.items-center.justify-between.g3', [
                h('.flex-row.items-center.g3', [
                    h('h2', `Fill No. ${fillNumber}`),
                    stableBeamBadge(lhcFill),
                ]),
                frontLink(
                    'Add log to this fill',
                    'log-create',
                    { lhcFillNumbers: [fillNumber] },
                    { id: 'create-log', class: 'btn btn-primary h2' },
                ),
            ]),
            detailsGrid(commonLhcFillDisplayConfiguration.slice(1), lhcFill, 'lhc-fill', '-'),
            tabbedPanelComponent(
                detailsModel.tabbedPanelModel,
                {
                    [LHC_FILL_DETAILS_PANELS_KEYS.RUNS]: 'Runs',
                    [LHC_FILL_DETAILS_PANELS_KEYS.LOGS]: 'Log entries',
                },
                {
                    [LHC_FILL_DETAILS_PANELS_KEYS.RUNS]: (panelData) => {
                        if (panelData === null) {
                            return spinner({ size: 5, absolute: false });
                        }
                        const { runs, runsCounter } = panelData;
                        const { runsTabModel } = detailsModel.tabbedPanelModel;
                        return [
                            h('.flex-row.items-end.mb2.g3', [
                                h('h3', 'Statistics'),
                                h('ul.nav.nav-tabs.flex-grow', [
                                    h(
                                        'li.nav-item',
                                        h(
                                            `#physics-runs-tab.nav-link.${runsTabModel.limitRunsToPhysics ? 'active' : 'primary'}`,
                                            {
                                                onclick: () => {
                                                    runsTabModel.limitRunsToPhysics = true;
                                                },
                                            },
                                            'PHYSICS',
                                        ),
                                    ),
                                    h('li.nav-item', h(`#all-runs-tab.nav-link.${runsTabModel.limitRunsToPhysics ? 'primary' : 'active'}`, {
                                        onclick: () => {
                                            runsTabModel.limitRunsToPhysics = false;
                                        },
                                    }, 'All')),
                                ]),
                            ]),
                            lhcFill.stableBeamsStart ? detailsGrid(
                                stableBeamStatisticsDisplayConfiguration,
                                lhcFill,
                                'lhc-fill',
                                '-',
                            ) : null,
                            h('h4', 'Runs'),
                            runsCounter && h('#statistics.details-container', [
                                h('.detail-section', [
                                    h('.flex-row.g3', [
                                        h('strong', 'Total:'),
                                        h('', runsCounter.total),
                                    ]),
                                    h('.flex-row.g3', [
                                        h('strong', `Over ${DURATION_PIVOT} minutes:`),
                                        h('', runsCounter.overLimit(durationLimit)),
                                    ]),
                                    h('.flex-row.g3', [
                                        h('strong', `Under ${DURATION_PIVOT} minutes:`),
                                        h('', runsCounter.underLimit(durationLimit)),
                                    ]),
                                ]),
                                h('.detail-section', [
                                    h('.flex-column.g1', [
                                        h('', 'Per quality'),
                                        h(
                                            '.flex-row.g3',
                                            runsCounter.perQuality.size > 0
                                                ? [...runsCounter.perQuality].map(([quality, count]) => h('.flex-row.g1', [
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
                                            runsCounter.perDetectors.size > 0
                                                ? [...runsCounter.perDetectors].map(([detector, count]) => h(
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
                            h('#runs', activeColumnsTable(runs, runsActiveColumns, null, { profile: 'lhcFill' })),
                        ];
                    },
                    [LHC_FILL_DETAILS_PANELS_KEYS.LOGS]: (logs) => activeColumnsTable(logs, logsActiveColumns, null, { profile: 'embeded' }),
                },
            ),
        ]);
    },
    Failure: (errors) => errorAlert(errors),
});
