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
import errorAlert from '../../../components/common/errorAlert.js';

/**
 * Render the preview component
 * @param {Object} model The model object
 * @param {String} text The text to be set to the preview
 * @returns {vnode} returns the preview node
 */
const mdBox = (model, text) => h('', [
    h('textarea#text.form-control', {
        placeholder: 'Your message...',
        disabled: true,
        onchange: (e) => model.logs.setText(e.target.value),
        oninit: () => {
            model.logs.setMarkdownBox('text', { location: 'logs', name: 'setText' }, { isReadOnly: false });
        },
    }, text),
]);

/**
 * A function to construct the create log screen
 * @param {object} model Pass the model to access the defined functions
 * @return {vnode} Return the view of the inputs
 */
const exportRunsScreen = (model) => {
    const runNumbers = []
    const data = model.logs.getCreatedLog(); // -> get runs info should be in data here
    const disabled = data.isLoading();

    if (model.router.params.parentLogId) {
        model.logs.setParentLogId(parseInt(model.router.params.parentLogId, 10));
    } else {
        model.logs.setParentLogId(-1);
    }

    return h('div#export-runs', [
        data.isFailure() && data.payload.map(errorAlert),

        h('', {
            onremove: () => model.logs.clearAllEditors(),
        }, [
            h('h2', 'Export Runs'),

            h('label.form-check-label.f4.mt2', { for: 'run-number' }, 'Run numbers'),
            h('label.form-check-label.f6', { for: 'run-number' }, `One or multiple run numbers, seperated by commas.'`),
            h('input#run-number.form-control.w-100', {
                placeholder: 'Enter the run numbers...',
                value: runNumbers,
                oninput: (e) => model.logs.setRunNumbers(e.target.value),
                disabled: model.router.params.id ? true : false,
            }),

            h('label.form-check-label.f4.mt2', { for: 'run-number' }, 'Fields'),
            h('label.form-check-label.f6', { for: 'run-number' }, `Select which fields needs to be exported'`),
            // user needs to be able to select which fields and which runs needs to be exported (need to retrieve every field like run type and put them into a select component)

            h('button.shadow-level1.btn.btn-success.mt2#send', {
                disabled,
                onclick: () => console.log("HERE COMES THE METHOD THAT HOLDS EXPORT TO CSV OR JSON LOGIC"),
            }, data.isLoading() ? 'Exporting...' : 'Export'),
        ]),
    ]);
};

export default (model) => exportRunsScreen(model);
