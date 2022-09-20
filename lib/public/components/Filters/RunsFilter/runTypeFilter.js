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

import { picker } from '../../pickers/tag/picker.js';
import { h } from '/js/src/index.js';

/**
 * Returns a filter component to filter on environment Ids, either a coma separated list of specific ids or a substring
 * search
 * @param {RunTypeModel} runTypeModel The global model object
 * @param {PickerModel} listingFilterModel actual picker model.
 * @return {vnode} A text box that allows the user to enter an environment substring to match against all runs or a
 *     list of environment ids
 */
const runTypeFilter = (runTypeModel, listingFilterModel) => {
    const service = runTypeModel.runTypeOverview;
    return service.runTypeModel.match({
        NotAsked: () => runTypeModel.loadOverview(),
        Loading: () => null,
        Success: (payload) => _filterRunType(payload, listingFilterModel),
        Failure: () => h('p', 'something went wrong refresh the page'),
    });
};

/**
 *  Creation of the html of the run type filter.
 *
 *  @param {Object[]} payload list with run type objects
 *  @param {PickerModel} listingFilterModel the actual picker model.
 *  @returns {vnode|vnode[]} a basic text when no checkboxes are used or a picker object
 */
const _filterRunType = (payload, listingFilterModel) => {
    const visibleCheckboxes = picker(payload.map((runType) => ({ text: runType.name, id: runType.id })), listingFilterModel);

    if (visibleCheckboxes.length === 0) {
        return h('p', 'No runTypes.');
    }
    return visibleCheckboxes;
};

export default runTypeFilter;
