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

import { frontLink } from '../../../utilities/frontLink.js';
import { formatTimestamp } from '../../../utilities/formatting/formatTimestamp.js';
import { formatDuration } from '../../../utilities/formatting/formatDuration.js';
import { formatPercentage } from '../../../utilities/formatting/formatPercentage.js';
import { h, iconWarning } from '/js/src/index.js';
import { popover } from '../../../components/common/popover/popover.js';

/**
 * Display configuration of a given LHC fill
 */
export const lhcFillDisplayConfiguration = [
    {
        fillNumber: {
            name: 'Fill number',
            format: (fill) => frontLink(fill, 'lhc-fill-details', { fillNumber: fill }),
        },
    },
    {
        stableBeamsStart: {
            name: 'Stable beams start',
            format: formatTimestamp,
        },
        stableBeamsEnd: {
            name: 'Stable beams end',
            format: formatTimestamp,
        },
        stableBeamsDuration: {
            name: 'Beams Duration',
            // Duration is given in seconds, convert to milliseconds for diplay
            format: (duration) => formatDuration(1000 * duration),
        },
    },
    {
        _visible: (lhcFill) => Boolean(lhcFill.stableBeamsStart),
        efficiency: {
            name: 'Fill Efficiency',
            format: (efficiency) => formatPercentage(efficiency),
        },
        durationBeforeFirstRun: {
            name: 'Before 1st run',
            format: (duration, lhcFill) => duration ? `${formatDuration(duration)} (${formatPercentage(lhcFill.efficiencyLossAtStart)})` : '-',
        },
        durationAfterLastRun: {
            name: 'After last run',
            format: (duration, lhcFill) => duration ? `${formatDuration(duration)} (${formatPercentage(lhcFill.efficiencyLossAtEnd)})` : '-',
        },
    },
    {
        _visible: (lhcFill) => Boolean(lhcFill.stableBeamsStart),
        meanRunDuration: {
            name: 'Mean run duration',
            format: (duration) => formatDuration(duration),
        },
        runsCoverage: {
            name: 'Total runs duration',
            format: (duration) => formatDuration(duration),
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
        beamType: {
            name: 'Beam Type',
        },
        fillingSchemeName: {
            name: 'Scheme name',
        },
    },
];
