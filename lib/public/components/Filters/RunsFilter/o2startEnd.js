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

import o2startFilter from './o2start.js';
import o2endFilter from './o2stop.js';
import { h } from '/js/src/index.js';

/**
 * Returns a dropdown menu and either the o2 start or o2 end filter component
 * @param {RunModel} runModel the run model object
 * @return {vnode} A start/end filter model and a dropdown menu for selecting which filter model
 */
const o2startEndFilter = (runModel) => {
    const dropdownOptions = ['Start range', 'Stop range'];
    const filterRange = runModel.getShowO2Start() ? o2startFilter(runModel) : o2endFilter(runModel);
    return h('', [
        h('select#startStop.form-control', {
            onchange: ({ target }) => {
                runModel.setShowO2Start(target.value === 'Start range');
            },
        }, dropdownOptions.map((reason, index) => h(
            `option#startStopOption${index}`,
            { value: reason },
            reason,
        ))),
        h('', filterRange),
    ]);
};

export default o2startEndFilter;
