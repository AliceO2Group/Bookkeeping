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

import { RunDefinition } from '../../../domain/enums/RunDefinition.js';
import { switchInput } from '../../../components/common/form/switchInput.js';

/**
 * Builds a button which will toggle the physics filter
 * @param {RunsOverviewModel} runsOverviewModel the model of the runs overview
 * @returns {vnode} with button
 */
export const showPhysicsButton = (runsOverviewModel) => {
    const isPhysicsActive = runsOverviewModel.isDefinitionOnlyOneInFilter(RunDefinition.Physics);
    const onChange = isPhysicsActive
        ? () => runsOverviewModel.setDefinitionFilter([])
        : () => runsOverviewModel.setDefinitionFilter([RunDefinition.Physics]);
    return switchInput(isPhysicsActive, onChange, { labelAfter: 'PHYSICS' });
};
