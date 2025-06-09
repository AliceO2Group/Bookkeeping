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

import { frontLink } from '../../../components/common/navigation/frontLink.js';
import { formatTimestamp } from '../../../utilities/formatting/formatTimestamp.js';
import { formatDuration } from '../../../utilities/formatting/formatDuration.mjs';
import { formatItemsCount } from '../../../utilities/formatting/formatItemsCount.js';

/**
 * Display configuration of a given LHC fill
 */
export const commonLhcFillDisplayConfiguration = [
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
            name: 'Beams duration',
            // Duration is given in seconds, convert to milliseconds for display
            format: (duration) => formatDuration(1000 * duration),
        },
    },
    {
        beamType: {
            name: 'Beam type',
        },
        fillingSchemeName: {
            name: 'Scheme name',
        },
    },
    {
        collidingBunchesCount: {
            name: 'Colliding bunches',
            format: formatItemsCount,
        },
        deliveredLuminosity: {
            name: 'Delivered lumi',
            format: (luminosity) => luminosity ? `${luminosity} nb-1` : '-',
        },
    },
];
