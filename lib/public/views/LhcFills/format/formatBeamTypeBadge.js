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
import { getBeamTypeFamily } from './beamTypeFamily.js';

/**
 * Display the beam type in a badge whose shape depends on what collides (no colors, as they are reserved to states)
 *
 * @param {string|null} beamType the beam type as sent by the LHC
 * @return {Component|string} the beam type badge, or a dash if there is no beam type
 */
export const formatBeamTypeBadge = (beamType) => beamType
    ? h(`.beam-type.beam-type-${getBeamTypeFamily(beamType)}`, beamType)
    : '-';
