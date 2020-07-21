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
        onchange: (e) => model.runs.setText(e.target.value),
        oninit: () => {
            model.runs.setMarkdownBox('text', { location: 'runs', name: 'setText' }, { isReadOnly: false });
        },
    }, text),
]);

/**
 * A function to construct the create run screen
 * @param {object} model Pass the model to access the defined functions
 * @return {vnode} Return the view of the inputs
 */
const createScreen = (model) => {
    const title = model.runs.getTitle();
    const text = model.runs.getText();
    const disabled = !(title.length > 2 && text.length > 2);
    const data = model.runs.getCreatedRun();

    if (model.router.params.parentRunId) {
        model.runs.parentRunId = parseInt(model.router.params.parentRunId, 10);
    } else {
        model.runs.parentRunId = -1;
    }

    return h('div#create-run', [
        data.isFailure() && data.payload.map(errorAlert),
        h('', {
            onremove: () => model.runs.flushModel(),
        }, [
            h('h2.mv2', 'Create Run'),
            h('h3.black.line-break: auto', 'Title of the run'),
            h('input#title.w-100', {
                placeholder: 'Enter the title of the run entry...',
                minlength: 3,
                maxlength: 140,
                value: title,
                oninput: (e) => model.runs.setTitle(e.target.value),
            }, title),
        ]),
        h('h3.black.line-break: auto', 'Text'),
        h('.shadow-level2.w-100', mdBox(model, text)),
        h('button.mv2.shadow-level1.btn.btn-success.m#send', {
            onclick: () => model.runs.createRun(),
            disabled,
        }, 'Create'),
    ]);
};

export default (model) => createScreen(model);
