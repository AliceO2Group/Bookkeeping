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
import { formatDuration } from '../../../utilities/formatting/formatDuration.js';

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
            name: 'Beams Duration',
            // Duration is given in seconds, convert to milliseconds for diplay
            format: (duration) => formatDuration(1000 * duration),
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
