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

import { getMulitpleSelectionValues } from '../../../utilities/getMultipleSelectionValues.js';
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
        Success: (payload) => _runTypeSelection(model, payload),
        Failure: () => h('p', 'something went wrong refresh the page'),
    });
};

/**
 *
 * @param {*} model
 * @returns
 */
const _runTypeSelection = (model, runTypes) =>{
    const runTypeId = 'runTypeRunFilter';
    return h('select.w-75.mt1', {
        multiple: true,
        id: runTypeId,
        value: model.runTypes.runTypesFilter,
        oninput: (e) => {
            model.runs.runTypesFilter = getMulitpleSelectionValues(e.target.selectedOptions);
        },
    }, [
        runTypes.map((runType) =>
            h('option', {
                value: runType.id,
            }, runType.name)),
    ]);
}
export default runTypeFilter;
