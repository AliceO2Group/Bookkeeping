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

import { runTypesPicker } from '../common/runTypesPicker.js';
import { h } from '/js/src/index.js';

/**
 * Returns a filter component to filter on environment Ids, either a coma separated list of specific ids or a substring
 * search
 * @param {Object} model The global model object
 * @return {vnode} A text box that allows the user to enter an environment substring to match against all runs or a
 *     list of environment ids
 */
const runTypeFilter = (model) => {
    const service = model.runTypes.runTypeService;
    return service.runTypes.match({
        NotAsked: () => model.runTypes.loadOverview(),
        Loading: () => null,
        Success: (payload) => _filterRunType(payload, model),
        Failure: () => h('p', 'something went wrong refresh the page'),
    });
};

/**
 *  Creation of the html of the run type filter.
 *
 *  @param {Object[]} payload list with run type objects
 *  @param {model} model the general model.
 *  @returns {vnode|vnode[]} a basic text when no checkboxes are used or a picker object
 */
const _filterRunType = (payload, model) => {
    const visibleCheckboxes = runTypesPicker(payload, model.runs.listingRunTypesFilterModel);

    if (visibleCheckboxes.length === 0) {
        return h('p', 'No runTypes.');
    }
    return visibleCheckboxes;
};

export default runTypeFilter;
