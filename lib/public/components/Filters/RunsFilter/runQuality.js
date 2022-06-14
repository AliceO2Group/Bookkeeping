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

const runQualities = ['good', 'bad', 'test'];

/**
 * Returns a panel to be used by user to filter runs by quality
 * @param {Object} model The global model object
 * @return {vnode} A text box that allows the user to enter a title substring to match against all logs
 */
const runQualityFilter = (model) => h('.flex-row', runQualities.map((runQuality) => h('.form-check.flex-grow', [
    h('input.form-check-input', {
        id: `runQualityCheckbox${runQuality}`,
        class: 'runQuality',
        type: 'checkbox',
        checked: model.runs.isRunQualityInFilter(runQuality),
        onchange: (e) => e.target.checked ? model.runs.addRunQualityFilter(runQuality) : model.runs.removeRunQualityFilter(runQuality),
    }),
    h('label.form-check-label', {
        for: `runQualityCheckbox${runQuality}`,
    }, runQuality.toUpperCase()),
])));

export default runQualityFilter;
