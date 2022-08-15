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
            visible: true,
            size: 'w-15',
            format: (efficiency) => formatPercentage(efficiency),
        },
        durationBeforeFirstRun: {
            name: 'Before 1st run',
            visible: true,
            size: 'w-15',
            format: (duration, lhcFill) => duration ? `${formatDuration(duration)} (${formatPercentage(lhcFill.efficiencyLossAtStart)})` : '-',
        },
    },
    {
        _visible: (lhcFill) => Boolean(lhcFill.stableBeamsStart),
        meanRunDuration: {
            name: 'Mean run duration',
            visible: true,
            size: 'w-15',
            format: (duration) => formatDuration(duration),
        },
        totalRunsDuration: {
            name: 'Total runs duration',
            visible: true,
            size: 'w-15',
            format: (duration) => formatDuration(duration),
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
