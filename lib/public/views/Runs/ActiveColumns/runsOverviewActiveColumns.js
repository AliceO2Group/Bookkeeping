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
import { runActionsComponents, runsActiveColumns } from './runsActiveColumns.js';
import { profiles } from '../../../components/common/table/profiles.js';
import { dataTakingConfiguration } from '../../../components/common/formatting/dataTakingConfiguration.js';
import { labelledLine } from '../../../components/common/formatting/labelledLine.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';
import { formatRunStart } from '../format/formatRunStart.js';
import { formatRunEnd } from '../format/formatRunEnd.js';
import { displayRunDuration } from '../format/displayRunDuration.js';
import { coloredCalibrationStatusComponent } from '../coloredCalibrationStatusComponent.js';
import { getRunQualityColor } from '../format/getRunQualityColor.js';
import { linkWithActionsDropdown } from '../../../components/common/selection/infoLoggerButtonGroup/linkWithActionsDropdown.js';
import { runDefinitionLegend } from '../format/runDefinitionLegend.js';
import { RunDefinition } from '../../../domain/enums/RunDefinition.js';
import { detectorStyleClass } from '../format/formatRunDetectorsInline.js';
import { formatTagsList } from '../../Tags/format/formatTagsList.js';
import { displayRunEorReasonsOverview } from '../format/displayRunEorReasonOverview.js';
import { BeamModes } from '../../../domain/enums/BeamModes.js';

const TAGS_DISPLAY_LIMIT = 2;

/**
 * Display the number of detectors followed by the detectors underlined by their quality, wrapped on several lines if needed so that no
 * detector is hidden
 *
 * @param {RunDetectorQuality[]} detectorsQualities the quality of each detector of the run
 * @param {number} nDetectors the number of detectors of the run
 * @return {Component|string} the detectors
 */
const formatDetectors = (detectorsQualities, nDetectors) => detectorsQualities?.length > 0
    ? h('', [
        h('.badge.bg-gray-light.mr1.nDetectors-badge', nDetectors),
        detectorsQualities.map((detector, index) => [
            h(`span.${detectorStyleClass(detector)}`, detector.name),
            h('span.mr1', index < detectorsQualities.length - 1 ? ',' : ''),
        ]),
    ])
    : '-';

const TIMING_LINE = { labelClass: 'timing-label' };

/**
 * Return a copy of the given column, hidden from the table but still providing its filter (and export) to the filters panel
 *
 * @param {string} key the key of the column in the runs active columns
 * @return {Column} the hidden column
 */
const hiddenColumn = (key) => ({ ...runsActiveColumns[key], visible: false, profiles: [profiles.none] });

/**
 * Display the definition and the quality of the run on one line, separated by a dash, with the calibration status of calibration runs on
 * its own line below
 *
 * @param {Run} run the run
 * @return {Component} the lines
 */
const runDefinitionAndQuality = ({ id, definition, calibrationStatus, runQuality }) => h('.flex-column.items-start.g1', [
    h(`#row${id}-definition-and-quality.flex-row.flex-wrap.items-baseline.g1.f7`, [
        definition
            ? h(`#row${id}-definition.run-definition.run-definition-${definition.toLowerCase()}`, definition)
            : h(`#row${id}-definition`, '-'),
        runQuality && h('span.gray-darker', '-'),
        runQuality && h(`#row${id}-quality`, { class: getRunQualityColor(runQuality) }, runQuality),
    ]),
    definition === RunDefinition.Calibration
        && h(`#row${id}-calibration-status.runs-calibration-status`, coloredCalibrationStatusComponent(calibrationStatus)),
]);

/**
 * List of active columns for the runs overview table
 *
 * The columns of the generic runs table are merged into denser ones, the merged ones are kept hidden to provide their filters and the export
 */
export const runsOverviewActiveColumns = {
    id: runsActiveColumns.id,
    runNumber: {
        ...runsActiveColumns.runNumber,
        name: 'Run',
        information: runDefinitionLegend(),
        classes: 'w-15 f6',
        noEllipsis: true,

        /**
         * Display the run number, with the definition and the quality of the run below it
         *
         * @param {number} runNumber the run number
         * @param {Run} run the run
         * @return {Component} the run number and its definition and quality
         */
        format: (runNumber, run) => h('.flex-column.items-start', [
            linkWithActionsDropdown(`row${run.id}-run-number`, runNumber, 'run-detail', { runNumber }, runActionsComponents(runNumber, run)),
            runDefinitionAndQuality(run),
        ]),
    },
    timing: {
        name: 'Timing',
        visible: true,
        classes: 'w-15 f6',
        noEllipsis: true,

        /**
         * Display the start, the stop and the duration of the run, each in its own labelled line
         *
         * @param {*} _ unused, the times are read from the run
         * @param {Run} run the run
         * @return {Component} the start, stop and duration
         */
        format: (_, run) => {
            const hideDateIfSameDayAs = run.timeTrgStart || run.timeO2Start;
            return h('', [
                labelledLine(`row${run.id}-start`, 'Start', formatRunStart(run, { inline: true }), TIMING_LINE),
                labelledLine(`row${run.id}-stop`, 'Stop', formatRunEnd(run, { inline: true, hideDateIfSameDayAs }), TIMING_LINE),
                labelledLine(`row${run.id}-runDuration`, 'Dur.', displayRunDuration(run), { ...TIMING_LINE, balloon: false }),
            ]);
        },
    },
    context: {
        name: 'Context',
        visible: true,
        classes: 'w-10 f6',

        /**
         * Display the LHC fill, the LHC period and the environment of the run, each in its own labelled line
         *
         * @param {*} _ unused, the values are read from the run
         * @param {Run} run the run
         * @return {Component} the fill, period and environment
         */
        format: (_, { id, fillNumber, lhcPeriod, lhcBeamMode, environmentId }) => {
            const isStableBeams = lhcBeamMode === BeamModes.STABLE_BEAMS;
            return h('', [
                labelledLine(
                    `row${id}-fillNumber`,
                    'Fill',
                    fillNumber !== null && isStableBeams ? frontLink(fillNumber, 'lhc-fill-details', { fillNumber }) : '-',
                ),
                labelledLine(`row${id}-lhcPeriod`, 'Period', lhcPeriod && isStableBeams ? lhcPeriod : '-'),
                labelledLine(
                    `row${id}-environmentId`,
                    'Env',
                    environmentId ? frontLink(environmentId, 'env-details', { environmentId }) : '-',
                ),
            ]);
        },
    },
    configuration: {
        name: 'Configuration',
        visible: true,
        classes: 'w-10 f6',

        /**
         * Display the number of EPNs and FLPs, the DCS state and the trigger of the run, two by line
         *
         * @param {*} _ unused, the values are read from the run
         * @param {Run} run the run
         * @return {Component} the EPNs, FLPs, DCS and trigger
         */
        format: (_, run) => dataTakingConfiguration(`row${run.id}`, run),
    },
    detectors: {
        ...runsActiveColumns.detectors,
        name: 'Detectors / EOR reason',
        classes: 'w-35 f6',
        balloon: false,
        noEllipsis: true,

        /**
         * Display the detectors of the run, with its end of run reasons below them
         *
         * @param {*} _ unused, the detectors are read from the run
         * @param {Run} run the run
         * @return {Component} the detectors and end of run reasons
         */
        format: (_, { id, detectorsQualities, nDetectors, eorReasons }) => h('.flex-column.g1', [
            h(`#row${id}-detectors`, formatDetectors(detectorsQualities, nDetectors)),
            eorReasons?.length > 0 && h('.flex-row.items-baseline.g1', [
                h('span.f7.gray-darker.flex-shrink-0', 'EOR'),
                h(`#row${id}-eorReasons`, displayRunEorReasonsOverview(eorReasons)),
            ]),
        ]),
    },
    tags: {
        ...runsActiveColumns.tags,
        classes: 'w-10 f6',
        balloon: false,
        noEllipsis: true,

        /**
         * Display the first tags of the run, followed by the number of remaining ones, all the tags being displayed in a popover on hover
         *
         * @param {Tag[]} tags the tags of the run
         * @param {Run} run the run
         * @return {Component} the tags
         */
        format: (tags, { id }) => h(`#row${id}-tags`, formatTagsList(tags, { flex: true, limit: TAGS_DISPLAY_LIMIT })),
    },

    // Columns displayed in a merged one, only providing their filters
    eorReasons: hiddenColumn('eorReasons'),
    definition: hiddenColumn('definition'),
    runQuality: hiddenColumn('runQuality'),
    timeO2Start: hiddenColumn('timeO2Start'),
    timeO2End: hiddenColumn('timeO2End'),
    runDuration: hiddenColumn('runDuration'),
    fillNumber: hiddenColumn('fillNumber'),
    lhcPeriod: hiddenColumn('lhcPeriod'),
    environmentId: hiddenColumn('environmentId'),
    nEpns: hiddenColumn('nEpns'),
    nFlps: hiddenColumn('nFlps'),
    dcs: hiddenColumn('dcs'),
    triggerValue: hiddenColumn('triggerValue'),

    // Other columns, hidden by default
    ...Object.fromEntries(Object.entries(runsActiveColumns).filter(([key]) => ![
        'id',
        'runNumber',
        'detectors',
        'tags',
        'eorReasons',
        'definition',
        'runQuality',
        'timeO2Start',
        'timeO2End',
        'runDuration',
        'fillNumber',
        'lhcPeriod',
        'environmentId',
        'nEpns',
        'nFlps',
        'dcs',
        'triggerValue',
    ].includes(key))),
};
