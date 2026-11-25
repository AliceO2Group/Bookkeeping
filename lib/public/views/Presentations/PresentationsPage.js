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
import { timeRangeFilter } from '../../components/Filters/common/filters/timeRangeFilter.js';
import errorAlert from '../../components/common/errorAlert.js';
import spinner from '../../components/common/spinner.js';

const templatePicker = (model) => model.templates.match({
    Success: (templates) => templates.length === 0
        ? h('p.gray-darker.mv0', 'No templates are available.')
        : h('.flex-column.g1', [
            h('label', { for: 'presentation-template' }, 'Template'),
            h('select.form-control#presentation-template', {
                value: model.templateId === null ? '' : String(model.templateId),
                disabled: model.isGenerating,
                onchange: (event) => model.selectTemplate(event.target.value),
            }, [
                h('option', { value: '' }, 'Choose a template'),
                ...templates.map(({ id, title }) => h('option', { value: String(id) }, title)),
            ]),
        ]),
    Failure: (errors) => errorAlert(errors),
    Other: () => h('p.gray-darker.mv0', { role: 'status' }, 'Loading templates…'),
});

const generationResult = (model) => model.result.match({
    Loading: () => h('#presentation-generation-status.flex-column.g2', { role: 'status' }, [
        spinner({ size: 2, justify: 'left', absolute: false }),
        h('p.mv0', 'Generating the presentation…'),
    ]),
    Success: ({ url, fileName }) => h('.flex-row.flex-wrap.items-center.g3', [
        h('strong', { role: 'status' }, 'Presentation ready'),
        h('a.btn.btn-primary#download-presentation', { href: url, download: fileName }, 'Download PDF'),
    ]),
    Failure: (errors) => h('#presentation-generation-error', { role: 'alert' }, errorAlert(errors)),
    Other: () => null,
});

const explanation = () => h(
    'p.mv0#presentations-explanation',
    'Choose a period and a template to generate a presentation as a PDF. A presentation covers every LHC fill with '
    + 'stable beams in the period. Each fill is shown in full, with all its PHYSICS runs, so the slides can include '
    + 'time before and after the period.',
);

/**
 * Display the form for generating a presentation from a template and period.
 * @param {Model} model the global model
 * @return {Component} the presentations page
 */
export const PresentationsPage = ({ presentationsModel }) => h('#presentations-page.flex-column.g3', {
    onremove: () => presentationsModel.close(),
}, [
    h('h1', 'Presentations'),
    explanation(),
    h('form.flex-column.g3', {
        onsubmit: (event) => {
            event.preventDefault();
            presentationsModel.generate();
        },
    }, [
        h('.flex-row.flex-wrap.items-end.g3', [
            h('#presentation-period.flex-column.g1', { inert: presentationsModel.isGenerating }, [
                h('span', ['Period ', h('span.gray-darker#presentation-period-time-zone', '(Geneva time)')]),
                timeRangeFilter(presentationsModel.timeRangeModel),
            ]),
            templatePicker(presentationsModel),
        ]),
        h('.flex-row', h('button.btn.btn-primary#generate-presentation', {
            type: 'submit',
            disabled: !presentationsModel.canGenerate,
        }, 'Generate presentation')),
    ]),
    generationResult(presentationsModel),
]);
