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
import { runsActiveColumns } from './runsActiveColumns.js';
import { profiles } from '../../../components/common/table/profiles.js';
import { overflowBalloon } from '../../../components/common/popover/overflowBalloon.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';
import { formatRunStart } from '../format/formatRunStart.js';
import { formatRunEnd } from '../format/formatRunEnd.js';
import { displayRunDuration } from '../format/displayRunDuration.js';
import { coloredCalibrationStatusComponent } from '../coloredCalibrationStatusComponent.js';
import { RunDefinition } from '../../../domain/enums/RunDefinition.js';
import { BeamModes } from '../../../domain/enums/BeamModes.js';

/**
 * Display a value preceded by a small label, on its own line
 *
 * @param {string} id the id of the line
 * @param {string} label the label of the line
 * @param {Component|string} content the content of the line
 * @return {Component} the line
 */
const labelledLine = (id, label, content) => h('.flex-row.items-center.g1', [
    h('span.f7.gray-darker.flex-shrink-0', label),
    h(`#${id}`, overflowBalloon(content)),
]);

/**
 * Return a copy of the given column, hidden from the table but still providing its filter (and export) to the filters panel
 *
 * @param {string} key the key of the column in the runs active columns
 * @return {Column} the hidden column
 */
const hiddenColumn = (key) => ({ ...runsActiveColumns[key], visible: false, profiles: [profiles.none] });

/**
 * Format the number of EPNs of a run: the count if known, ON if EPNs were used without a known count, OFF otherwise
 *
 * @param {boolean} epn true if the run used EPNs
 * @param {number|null} nEpns the number of EPNs
 * @return {string|number} the formatted value
 */
const formatEpnsCount = (epn, nEpns) => {
    if (!epn) {
        return 'OFF';
    }
    return typeof nEpns === 'number' ? nEpns : 'ON';
};

/**
 * Display the definition (with the calibration status) and the quality of the run, below the run number
 *
 * @param {Run} run the run
 * @return {Component} the lines
 */
const runDefinitionAndQuality = ({ id, definition, calibrationStatus, runQuality }) => h('.flex-column', [
    h(`#row${id}-definition.flex-row.g2.items-center.f7`, [
        h('', definition || '-'),
        definition === RunDefinition.Calibration && coloredCalibrationStatusComponent(calibrationStatus),
    ]),
    h(`#row${id}-quality.f7.gray-darker`, runQuality),
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
        classes: 'w-10 f6',

        /**
         * Display the run number, with the definition and the quality of the run below it
         *
         * @param {number} runNumber the run number
         * @param {Run} run the run
         * @return {Component} the run number and its definition and quality
         */
        format: (runNumber, run) => h('.flex-column.items-start', [
            h(`#row${run.id}-run-number`, runsActiveColumns.runNumber.format(runNumber, run)),
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
        format: (_, run) => h('', [
            labelledLine(`row${run.id}-start`, 'Start', formatRunStart(run, { inline: true })),
            labelledLine(`row${run.id}-stop`, 'Stop', formatRunEnd(run, { inline: true })),
            labelledLine(`row${run.id}-runDuration`, 'Dur.', displayRunDuration(run)),
        ]),
    },
    context: {
        name: 'Context',
        visible: true,
        classes: 'w-15 f6',

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
        format: (_, { id, epn, nEpns, nFlps, dcs, triggerValue }) => h('', [
            h(`#row${id}-nodes.flex-row.g2`, [
                labelledLine(`row${id}-nEpns`, 'EPNs', formatEpnsCount(epn, nEpns)),
                labelledLine(`row${id}-nFlps`, 'FLPs', nFlps ?? '-'),
            ]),
            h(`#row${id}-states.flex-row.g2`, [
                labelledLine(`row${id}-dcs`, 'DCS', dcs ? 'On' : 'Off'),
                labelledLine(`row${id}-triggerValue`, 'TRG', triggerValue || '-'),
            ]),
        ]),
    },
    detectors: { ...runsActiveColumns.detectors, classes: 'w-20 f6' },
    tags: { ...runsActiveColumns.tags, classes: 'w-10 f6' },
    eorReasons: { ...runsActiveColumns.eorReasons, classes: 'w-15 f6' },

    // Columns displayed in a merged one, only providing their filters
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
