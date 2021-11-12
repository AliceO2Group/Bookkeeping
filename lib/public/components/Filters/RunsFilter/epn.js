/**
 * @license
 * Copyright CERN and copyright holders of ALICE Trg. This software is
 * distributed under the terms of the GNU General Public License v3 (GPL
 * Version 3), copied verbatim in the file "COPYING".
 *
 * See http://alice-Trg.web.cern.ch/license for full licensing information.
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

import { h } from '/js/src/index.js';

/**
 * Returns the creation date filter components
 * @param {Object} model The global model object
 * @return {vnode} Two date selection boxes to control the minimum and maximum creation dates for the log filters
 */
const epnOperationRadioButtons = (model) => h('.form-group-header.flex-row', [true].map((operation) =>
    h('.form-check.mr2', [
        h('input.form-check-input', {
            onclick: () => model.runs.setEpnFilterOperation(operation),
            id: `epnFilterOperationRadioButton${operation}`,
            checked: operation === model.runs.getEpnFilterOperation(),
            type: 'radio',
            name: 'operationRadioButtons3',
            value: model.runs.getEpnFilterOperation(),
        }, ''),
        h('label.form-check-label', {
            for: `epnFilterOperationRadioButton${operation}`,
        }, operation),
    ])));

export default epnOperationRadioButtons;
