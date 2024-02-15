/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */
import { OnCallLogTemplate } from './OnCallLogTemplate.js';
import { PanelComponent } from '../../../components/common/panel/PanelComponent.js';
import { LabelPanelHeaderComponent } from '../../../components/common/panel/LabelPanelHeaderComponent.js';
import spinner from '../../../components/common/spinner.js';
import errorAlert from '../../../components/common/errorAlert.js';
import { markdownInput } from '../../../components/common/markdown/markdown.js';
import { h } from '/js/src/index.js';

/**
 * On call template configuration
 *
 * @param {LogCreationModel} creationModel the log creation model
 * @param {LogTemplate} template the log creation template
 * @return {Partial<LogCreationFormConfiguration>} the on-call template configuration
 */
export const onCallLogCreationConfiguration = (creationModel, template) => {
    if (!(template instanceof OnCallLogTemplate)) {
        return {};
    }

    return {
        mainPane: [
            h(PanelComponent, [
                h(LabelPanelHeaderComponent, { required: true, for: 'shortDescription' }, 'Short description'),
                h('input#shortDescription.form-control', {
                    placeholder: 'Enter a short description of the issue',
                    minlength: 4,
                    maxlength: 30,
                    value: template.formData.shortDescription,
                    oninput: (e) => template.patchFormData({ shortDescription: e.target.value }),
                }),
            ]),
            h('.flex-row.g3', [
                h(PanelComponent, [
                    h(LabelPanelHeaderComponent, { required: true, for: 'detectorOrSubsystem' }, 'Detector or subsystem to be called'),
                    template.detectorsAndSystems.match({
                        NotAsked: () => null,
                        Loading: () => spinner({ size: 2, absolute: false }),
                        Success: (systems) =>
                            h(
                                'select#detectorOrSubsystem.form-control',
                                { onchange: (e) => template.patchFormData({ detectorOrSubsystem: e.target.value }) },
                                [
                                    h('option', { disabled: null, selected: true }, '- None -'),
                                    ...systems.map((detectorOrSubsystem) => h(
                                        'option',
                                        { value: detectorOrSubsystem },
                                        detectorOrSubsystem,
                                    )),
                                ],
                            ),
                        Failure: (error) => errorAlert(error),
                    }),
                ]),
                h(PanelComponent, { class: 'flex-grow' }, [
                    h(LabelPanelHeaderComponent, { required: true, for: 'severity' }, 'Severity level of the issue'),
                    h(
                        'select#severity.form-control',
                        { onchange: (e) => template.patchFormData({ severity: e.target.value }) },
                        [
                            h('option', { disabled: true, selected: true }, '- None -'),
                            ['Critical', 'Severe', 'Minor'].map((severity) => h(
                                'option',
                                { value: severity },
                                severity,
                            )),
                        ],
                    ),
                ]),
                h(PanelComponent, { class: 'flex-grow' }, [
                    h(LabelPanelHeaderComponent, { required: true, for: 'issueScope' }, 'Scope of the issue'),
                    h(
                        'select#issueScope.form-control',
                        { onchange: (e) => template.patchFormData({ scope: e.target.value }) },
                        [
                            h('option', { disabled: true, selected: true }, '- None -'),
                            ['Detector safety', 'Data taking', 'System commissioning', 'Other'].map((scope) => h(
                                'option',
                                { value: scope },
                                scope,
                            )),
                        ],
                    ),
                ]),
            ]),
            h('.flex-row.g3', [
                h(PanelComponent, { class: 'flex-grow' }, [
                    h(LabelPanelHeaderComponent, { required: true }, 'Shifter name'),
                    h('input#shifterName.form-control', { disabled: true, value: template.formData.shifterName }),
                ]),
                h(PanelComponent, { class: 'flex-grow' }, [
                    h(LabelPanelHeaderComponent, { required: true, for: 'shifterPosition' }, 'Shifter position'),
                    h(
                        'select#shifterPosition.form-control',
                        { onchange: (e) => template.patchFormData({ shifterPosition: e.target.value }) },
                        [
                            h('option', { disabled: true, selected: true }, '- None -'),
                            ['DCS', 'ECS', 'QC/PDP', 'SL'].map((shifterPosition) => h(
                                'option',
                                { value: shifterPosition },
                                shifterPosition,
                            )),
                        ],
                    ),
                ]),
            ]),
            h(PanelComponent, [
                h(LabelPanelHeaderComponent, { required: true, for: 'lhcBeamMode' }, 'LHC Beam mode'),
                h(
                    'input#lhcBeamMode.form-control',
                    {
                        value: template.formData.lhcBeamMode,
                        oninput: (e) => template.patchFormData({ lhcBeamMode: e.target.value }),
                    },
                ),
            ]),
            h(PanelComponent, { class: 'flex-column flex-grow' }, [
                h(LabelPanelHeaderComponent, { required: true, for: 'issue-description' }, 'Description of the issue'),
                markdownInput(
                    template.formData.issueDescription,
                    {
                        id: 'issue-description',
                        onchange: (e) => template.patchFormData({ issueDescription: e.target.value }),
                        class: 'flex-grow',
                    },
                    { height: '100%' },
                ),
            ]),
            h(PanelComponent, { class: 'flex-column flex-grow' }, [
                h(LabelPanelHeaderComponent, { required: true }, 'Reason to call this on-call'),
                markdownInput(
                    template.formData.reason,
                    {
                        id: 'reason-to-call-on-call',
                        onchange: (e) => template.patchFormData({ reason: e.target.value }),
                        class: 'flex-grow',
                    },
                    { height: '100%' },
                ),
            ]),
            h(PanelComponent, { class: 'flex-column flex-grow' }, [
                h(LabelPanelHeaderComponent, { required: true }, 'Actions already taken'),
                markdownInput(
                    template.formData.alreadyTakenActions,
                    {
                        id: 'actions-already-taken',
                        onchange: (e) => template.patchFormData({ alreadyTakenActions: e.target.value }),
                        class: 'flex-grow',
                    },
                    { height: '100%' },
                ),
            ]),
        ],
    };
};
