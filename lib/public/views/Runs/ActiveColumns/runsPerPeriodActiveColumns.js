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
import { switchCase } from '/js/src/index.js';
import runNumberFilter from '../../../components/Filters/RunsFilter/runNumber.js';
import { displayRunNumber } from '../format/displayRunNumber.js';
import { formatRunStart } from '../format/formatRunStart.js';
import { formatRunEnd } from '../format/formatRunEnd.js';
import { formatTimestamp } from '../../../utilities/formatting/formatTimestamp.js';
import o2endFilter from '../../../components/Filters/RunsFilter/o2stop.js';
import o2startFilter from '../../../components/Filters/RunsFilter/o2start.js';
import fillNumbersFilter from '../../../components/Filters/RunsFilter/fillNumbers.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';
import { profiles } from '../../../components/common/table/profiles.js';
import { formatDetectorQuality } from '../format/formatDetectorQuality.js';

/**
 * Formatt alice current value
 * @param {'NEGATIVE'|'POSITIVE'|null} polarity polarity of a current
 * @param {number} current absolute value of a current
 * @return {string} formatted value
 */
const formatAliceCurrent = (polarity, current) => (
    switchCase(polarity, { NEGATIVE: -1, POSITIVE: 1, null: 1 }) * current
).toLocaleString('en-US');

export const RunsPeriodActiveColumns = {
    id: {
        name: 'ID',
        visible: false,
        primary: true,
    },
    runNumber: {
        name: 'Run',
        visible: true,
        size: 'w-7 f6 w-wrapped',
        filter: runNumberFilter,
        format: (_, run) => displayRunNumber(run),
        profiles: {
            lhcFill: true,
            environment: true,
            home: {
                name: 'Number',
                format: null,
                size: 'w-20',
            },
        },
    },
    timeO2Start: {
        name: 'O2 Start',
        visible: true,
        size: 'f6, w-wrapped',
        noEllipsis: true,
        format: (_, run) => formatRunStart(run, false),
        exportFormat: (timestamp) => formatTimestamp(timestamp),
        filter: o2startFilter,
        profiles: {
            lhcFill: true,
            environment: true,
            home: {
                name: 'Start',
                size: 'w-30',
                format: (_, run) => formatRunStart(run, true),
            },
        },
    },
    timeO2End: {
        name: 'O2 Stop',
        visible: true,
        size: 'f6, w-wrapped',
        noEllipsis: true,
        format: (_, run) => formatRunEnd(run, false),
        exportFormat: (timestamp) => formatTimestamp(timestamp),
        filter: o2endFilter,
        profiles: {
            lhcFill: true,
            environment: true,
            home: {
                name: 'Stop',
                size: 'w-30',
                format: (_, run) => formatRunEnd(run, true),

            },
        },
    },
    timeTrgStart: {
        name: 'TRG Start',
        visible: true,
        size: 'f6, w-wrapped',
        format: (timestamp) => formatTimestamp(timestamp, false),
        exportFormat: (timestamp) => formatTimestamp(timestamp),
    },
    timeTrgEnd: {
        name: 'TRG Stop',
        visible: true,
        size: 'f6, w-wrapped',
        format: (timestamp) => formatTimestamp(timestamp, false),
        exportFormat: (timestamp) => formatTimestamp(timestamp),
    },

    fillNumber: {
        name: 'Fill No.',
        visible: true,
        profiles: [profiles.none, 'lhcFill', 'environment'],
        size: 'f6, w-wrapped',
        format: (fill) => fill !== null ? frontLink(fill, 'lhc-fill-details', { fillNumber: fill }) : '-',
        filter: fillNumbersFilter,
    },

    aliceL3Current: {
        name: 'L3 [A]',
        visible: true,
        format: (_, run) => formatAliceCurrent(run.aliceL3Polarity, run.aliceL3Current),
    },

    dipoleCurrent: {
        name: 'Dipole [A]',
        visible: true,
        format: (_, run) => formatAliceCurrent(run.aliceDipolePolarity, run.aliceDipoleCurrent),
    },
};

/**
 * Factory for detectors related active columns configuration
 * @param {{name: string}[]} detectors detectors list
 * @return {object} active columns configuration
 */
export const getDetectorsActiveColumns = (detectors) => Object.fromEntries(detectors?.map(({ name: detectorName }) => [
    detectorName, {
        name: detectorName.toUpperCase(),
        visible: true,
        format: (_, run) => formatDetectorQuality(run.detectorsQualities.find(({ name }) => name === detectorName)?.quality),
    },
]) ?? []);
