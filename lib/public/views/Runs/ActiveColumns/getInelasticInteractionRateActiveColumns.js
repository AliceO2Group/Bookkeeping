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

import { PdpBeamType } from '../../../domain/enums/PdpBeamType.js';
import { inelasticInteractionRateActiveColumnsForPbPb as inelForPbPb } from './inelasticInteractionRateActiveColumnsForPbPb.js';
import { inelasticInteractionRateActiveColumnsForProtonProton as inelForPP } from './inelasticInteractionRateActiveColumnsForProtonProton.js';

/**
 * Get appropriate runs' activate columns dependent on their pdp beam types
 *
 * @param {string[]} pdpBeamTypes lit of pdp beam types
 * @return {ActiveColumn} active column
 */
export const getInelasticInteractionRateColumns = (pdpBeamTypes) => ({
    ...pdpBeamTypes.includes(PdpBeamType.LEAD_LEAD) ? inelForPbPb : {},
    ...pdpBeamTypes.includes(PdpBeamType.PROTON_PROTON) ? inelForPP : {},
    ...pdpBeamTypes.length === 0 ? { ...inelForPP, ...inelForPbPb } : {},
});
