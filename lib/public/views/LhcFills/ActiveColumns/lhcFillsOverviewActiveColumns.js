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

import { CopyToClipboardComponent, h } from '/js/src/index.js';
import { iconPlus } from '/js/src/icons.js';
import { lhcFillsActiveColumns } from './lhcFillsActiveColumns.js';
import { profiles } from '../../../components/common/table/profiles.js';
import { labelledLine } from '../../../components/common/formatting/labelledLine.js';
import { linkWithActionsDropdown } from '../../../components/common/selection/infoLoggerButtonGroup/linkWithActionsDropdown.js';
import { infologgerLinksComponents } from '../../../components/common/externalLinks/infologgerLinksComponents.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';
import { formatTimestamp } from '../../../utilities/formatting/formatTimestamp.js';
import { formatTimestampAlignedWith } from '../../../utilities/formatting/formatTimestampAlignedWith.js';
import { formatDuration } from '../../../utilities/formatting/formatDuration.mjs';
import { formatLhcFillsTimeLoss } from '../format/formatLhcFillsTimeLoss.js';
import { formatBeamTypeBadge } from '../format/formatBeamTypeBadge.js';
import { formatEfficiency } from '../format/formatEfficiency.js';
import { efficiencyLegend } from '../format/efficiencyLegend.js';
import { beamTypeLegend } from '../format/beamTypeLegend.js';

const TIMING_LINE = { labelClass: 'timing-label' };
const EFFICIENCY_LINE = { labelClass: 'efficiency-label' };
const RUNS_DURATION_LINE = { labelClass: 'runs-duration-label' };

/**
 * Return a copy of the given column, hidden from the table but still providing its filter to the filters panel
 *
 * @param {string} key the key of the column in the LHC fills active columns
 * @return {Column} the hidden column
 */
const hiddenColumn = (key) => ({ ...lhcFillsActiveColumns[key], visible: false, profiles: [profiles.none] });

/**
 * List of active columns for the LHC fills overview table
 *
 * The columns of the generic LHC fills table are merged into denser ones, the merged ones are kept hidden to provide their filters. The hidden
 * columns are interleaved with the displayed ones so that the filters keep the order of the generic table
 */
export const lhcFillsOverviewActiveColumns = {
    fillNumber: {
        ...lhcFillsActiveColumns.fillNumber,
        name: 'Fill #',
        information: beamTypeLegend(),
        size: 'w-7',
        noEllipsis: true,

        /**
         * Display the fill number as a link to the fill with its actions, with its beam type below
         *
         * @param {number} fillNumber the fill number
         * @param {LhcFill} lhcFill the LHC fill
         * @return {Component} the fill number and its beam type
         */
        format: (fillNumber, { runs = [], beamType }) => h('.flex-column.items-start.g1', [
            linkWithActionsDropdown(
                `row${fillNumber}-fill-number`,
                fillNumber,
                'lhc-fill-details',
                { fillNumber },
                [
                    h(CopyToClipboardComponent, { value: fillNumber, id: fillNumber }, 'Copy Fill Number'),
                    ...infologgerLinksComponents({ runNumbers: runs.map(({ runNumber }) => runNumber) }),
                    frontLink(
                        [iconPlus(), ' Add log to this fill'],
                        'log-create',
                        { lhcFillNumbers: [fillNumber] },
                        { id: 'create-log', class: 'btn btn-primary h2' },
                    ),
                ],
            ),
            h(`#row${fillNumber}-beamType`, formatBeamTypeBadge(beamType)),
        ]),
    },
    stableBeamsStartAndEnd: {
        name: 'Stable beams',
        visible: true,
        size: 'w-15',
        classes: 'f6',
        noEllipsis: true,

        /**
         * Display the start and the end of the stable beams, each in its own labelled line
         *
         * @param {*} _ unused, the values are read from the fill
         * @param {LhcFill} lhcFill the LHC fill
         * @return {Component} the start and the end
         */
        format: (_, { fillNumber, stableBeamsStart, stableBeamsEnd }) => h('', [
            labelledLine(`row${fillNumber}-stableBeamsStart`, 'Start', formatTimestamp(stableBeamsStart, true), TIMING_LINE),
            labelledLine(
                `row${fillNumber}-stableBeamsEnd`,
                'End',
                formatTimestampAlignedWith(stableBeamsEnd, stableBeamsStart),
                TIMING_LINE,
            ),
        ]),
    },
    stableBeamsStart: hiddenColumn('stableBeamsStart'),
    stableBeamsEnd: hiddenColumn('stableBeamsEnd'),
    stableBeams: lhcFillsActiveColumns.stableBeams,
    stableBeamsDuration: { ...lhcFillsActiveColumns.stableBeamsDuration, name: 'SB Duration', size: 'w-7', classes: 'f6' },
    efficiency: {
        ...lhcFillsActiveColumns.efficiency,
        name: 'Efficiency',
        information: efficiencyLegend(),
        size: 'w-15',
        classes: 'f6',
        noEllipsis: true,

        /**
         * Display the efficiency of the fill, with the time lost before the first run below it
         *
         * @param {number} efficiency the efficiency of the fill
         * @param {LhcFill} lhcFill the LHC fill
         * @return {Component} the efficiency and the time loss
         */
        format: (efficiency, { fillNumber, timeLossAtStart, efficiencyLossAtStart }) => h('', [
            labelledLine(`row${fillNumber}-efficiencyValue`, 'Efficiency', formatEfficiency(efficiency), EFFICIENCY_LINE),
            labelledLine(
                `row${fillNumber}-timeLossAtStart`,
                'Before 1st run',
                formatLhcFillsTimeLoss(timeLossAtStart, efficiencyLossAtStart),
                EFFICIENCY_LINE,
            ),
        ]),
    },
    timeLossAtStart: hiddenColumn('timeLossAtStart'),
    timeLossAtEnd: lhcFillsActiveColumns.timeLossAtEnd,
    runsDurations: {
        name: 'Runs duration',
        visible: true,
        size: 'w-10',
        classes: 'f6',
        noEllipsis: true,

        /**
         * Display the mean duration of the runs of the fill and their total duration, each in its own labelled line
         *
         * @param {*} _ unused, the values are read from the fill
         * @param {LhcFill} lhcFill the LHC fill
         * @return {Component} the mean and total durations
         */
        format: (_, { fillNumber, meanRunDuration, runsCoverage }) => h('', [
            labelledLine(`row${fillNumber}-meanRunDuration`, 'Mean', formatDuration(meanRunDuration), RUNS_DURATION_LINE),
            labelledLine(`row${fillNumber}-runsCoverage`, 'Total', formatDuration(runsCoverage), RUNS_DURATION_LINE),
        ]),
    },
    meanRunDuration: hiddenColumn('meanRunDuration'),
    runsCoverage: hiddenColumn('runsCoverage'),
    beamType: hiddenColumn('beamType'),
    collidingBunches: hiddenColumn('collidingBunches'),
    fillingSchemeName: {
        ...lhcFillsActiveColumns.fillingSchemeName,
        size: 'w-20',
        classes: 'f6',
        balloon: false,
        noEllipsis: true,

        /**
         * Display the name of the filling scheme with the number of colliding bunches below it
         *
         * @param {string|null} name the name of the filling scheme
         * @param {LhcFill} lhcFill the LHC fill
         * @return {Component} the filling scheme and the colliding bunches
         */
        format: (name, { fillNumber, collidingBunchesCount }) => h('', [
            labelledLine(`row${fillNumber}-schemeName`, 'Scheme', name || '-'),
            labelledLine(`row${fillNumber}-collidingBunches`, 'Bunches', collidingBunchesCount || '-'),
        ]),
    },
    runs: { ...lhcFillsActiveColumns.runs, size: 'w-20', classes: 'f6' },
};
