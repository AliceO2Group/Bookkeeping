/**
 * @license
 * Copyright 2019-2020 CERN and copyright holders of ALICE O2.
 * See http://alice-o2.web.cern.ch/copyright for details of the copyright holders.
 * All rights not expressly granted are reserved.
 *
 * This software is distributed under the terms of the GNU General Public
 * License v3 (GPL Version 3), copied verbatim in the file "COPYING".
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

import { formatTimestamp } from '../../../utilities/formatting/formatTimestamp.js';
import { formatDuration } from '../../../utilities/formatting/formatDuration.mjs';
import { frontLink } from '../../../components/common/navigation/frontLink.js';
import { formatPercentage } from '../../../utilities/formatting/formatPercentage.js';
import { h } from '/js/src/index.js';
import { formatRunsList } from '../../Runs/format/formatRunsList.js';

/**
 * List of active columns for a lhc fills table
 */
export const lhcFillsActiveColumns = {
    fillNumber: {
        name: 'Fill #',
        visible: true,
        primary: true,
        size: 'w-8',
        format: (fillNumber) => frontLink(fillNumber, 'lhc-fill-details', { fillNumber: fillNumber }),
    },
    stableBeamsStart: {
        name: 'Stable beams start',
        visible: true,
        size: 'w-8',
        format: (timestamp) => formatTimestamp(timestamp),
    },
    stableBeamsEnd: {
        name: 'Stable beams end',
        visible: true,
        size: 'w-8',
        format: (timestamp) => formatTimestamp(timestamp),
    },
    stableBeamsDuration: {
        name: 'Beams Duration',
        visible: true,
        size: 'w-8',
        format: (time, { stableBeamsStart, stableBeamsEnd }) => {
            if (time) {
                return formatDuration(time * 1000);
            }

            if (stableBeamsStart && !stableBeamsEnd) {
                return h('.badge.bg-success.white', 'ONGOING');
            }

            return '-';
        },
    },
    beamType: {
        name: 'Beam Type',
        visible: true,
        size: 'w-8',
        format: (value) => value ? value : '-',
    },
    efficiency: {
        name: 'Fill Efficiency',
        visible: true,
        size: 'w-8',
        format: (efficiency) => formatPercentage(efficiency),
    },
    durationBeforeFirstRun: {
        name: 'Before 1st run',
        visible: true,
        size: 'w-8',
        format: (duration, lhcFill) => duration ? `${formatDuration(duration)} (${formatPercentage(lhcFill.efficiencyLossAtStart)})` : '-',
    },
    durationAfterLastRun: {
        name: 'After last run',
        visible: true,
        size: 'w-8',
        format: (duration, lhcFill) => duration ? `${formatDuration(duration)} (${formatPercentage(lhcFill.efficiencyLossAtEnd)})` : '-',
    },
    meanRunDuration: {
        name: 'Mean run duration',
        visible: true,
        size: 'w-8',
        format: (duration) => formatDuration(duration),
    },
    runsCoverage: {
        name: 'Total runs duration',
        visible: true,
        size: 'w-8',
        format: (duration) => formatDuration(duration),
    },
    fillingSchemeName: {
        name: 'Scheme name',
        visible: true,
        size: 'w-10',
        format: (value) => value ? value : '-',
    },
    runs: {
        name: 'Runs',
        visible: true,
        sortable: false,
        size: 'w-10',
        title: true,
        format: formatRunsList,
        balloon: true,
    },
};
