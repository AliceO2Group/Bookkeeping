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

import { checkboxFilter } from '../common/checkboxFilter.js';

const RUN_DEFINITIONS = ['PHYSICS', 'COSMIC', 'TECHNICAL', 'SYNTHETIC'];

/**
 * Returns the definition filter component
 * @param {Object} model The global model object
 * @return {vnode} A list of checkboxes that lets the user look for runs with specific definition
 */
const definitionFilter = (model) => checkboxFilter(
    'runDefinition',
    RUN_DEFINITIONS,
    (runQuality) => model.runs.isDefinitionInFilter(runQuality),
    (e, definition) => e.target.checked
        ? model.runs.addDefinitionFilter(definition)
        : model.runs.removeDefinitionFilter(definition),
);

export default definitionFilter;
