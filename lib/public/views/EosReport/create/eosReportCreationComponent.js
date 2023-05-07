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

import { h, switchCase } from '/js/src/index.js';
import { markdownInput } from '../../../components/common/markdown/markdown.js';
import spinner from '../../../components/common/spinner.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';
import { creationFormComponent } from '../../../components/common/form/creationFormComponent.js';
import { getLocaleDateAndTime } from '../../../utilities/dateUtils.js';
import { eosFormEcsSpecificPart } from './typeSpecific/eosFormEcsSpecificPart.js';
import { ShiftTypes } from '../../../domain/enums/ShiftTypes.js';
import { eosFormQcPdpSpecificPart } from './typeSpecific/eosFormQcPdpSpecificPart.js';

/**
 * Generate the form to create EOS report
 *
 * @param {string} reportType the type of the report
 * @param {object} formData the creation model's form current data
 * @param {object} shiftData the auto-generated shift data
 * @return {Component} the form component
 */
const eosReportCreationForm = (reportType, formData, shiftData) => [
    h('.flex-column.g3', [
        h('.flex-row.g3', [
            h('#shifter-name.panel.flex-grow', [
                h('label.panel-header', 'Shifter name'),
                h('input.form-control', {
                    value: formData.shifterName,
                    // eslint-disable-next-line no-return-assign
                    oninput: (e) => formData.shifterName = e.target.value,
                }),
            ]),
            h('#trainee-name.panel.flex-grow', [
                h('label.panel-header', 'Trainee name'),
                h('input.form-control', {
                    value: formData.traineeName,
                    // eslint-disable-next-line no-return-assign
                    oninput: (e) => formData.traineeName = e.target.value,
                }),
            ]),
        ]),
        h('#issues-block.panel', [
            h('.panel-header', 'Issues during the shift'),
            h('', [
                h(
                    '.m0.p2.flex-column',
                    shiftData.issuesLogs.length > 0
                        ? shiftData.issuesLogs.map((log) => {
                            const formattedTags = log.tags.length > 0 ? log.tags.map(({ text }) => text).join(', ') : '**no tags**';
                            return h('', [
                                `- [${formattedTags}] - `,
                                frontLink(log.title, 'log-detail', { id: log.id }, { onclick: () => true, target: '_blank' }),
                            ]);
                        })
                        : '-',
                ),
            ]),
        ]),
        h('#lhc-transitions.panel', [
            h('label.panel-header', 'LHC (list all machine transitions)'),
            markdownInput(
                formData.lhcTransitions,
                {
                    // eslint-disable-next-line no-return-assign
                    oninput: (e) => formData.lhcTransitions = e.target.value,
                },
                null,
                { height: '20rem' },
            ),
        ]),
        h('#shift-flow.panel', [
            h('label.panel-header', 'Shift flow'),
            markdownInput(
                formData.shiftFlow,
                {
                    // eslint-disable-next-line no-return-assign
                    oninput: (e) => formData.shiftFlow = e.target.value,
                },
                null,
                { height: '20rem' },
            ),
        ]),
        switchCase(reportType, {
            [ShiftTypes.ECS]: () => eosFormEcsSpecificPart(formData, shiftData),
            [ShiftTypes.QC_PDP]: () => eosFormQcPdpSpecificPart(formData, shiftData),
        }, () => {
        })(),
        h('#from-previous-shifter.panel', [
            h('label.panel-header', 'Info from previous shifter'),
            markdownInput(
                formData.infoFromPreviousShifter,
                {
                    // eslint-disable-next-line no-return-assign
                    oninput: (e) => formData.infoFromPreviousShifter = e.target.value,
                },
                null,
                { height: '10rem' },
            ),
        ]),
        h('#for-next-shifter.panel', [
            h('label.panel-header', 'Info for next shifter'),
            markdownInput(
                formData.infoForNextShifter,
                {
                    // eslint-disable-next-line no-return-assign
                    oninput: (e) => formData.infoForNextShifter = e.target.value,
                },
                null,
                { height: '10rem' },
            ),
        ]),
        h('#for-rm-rc.panel', [
            h('label.panel-header', 'Info for RM/RC'),
            markdownInput(
                formData.infoForRmRc,
                {
                    // eslint-disable-next-line no-return-assign
                    oninput: (e) => formData.infoForRmRc = e.target.value,
                },
                null,
                { height: '10rem' },
            ),
        ]),
    ]),
];

/**
 * Returns the EOS report creation component
 *
 * @param {EosReportCreationModel} eosReportCreationModel the EOS report creation model
 * @return {Component} the EOS report creation component
 */
export const eosReportCreationComponent = (eosReportCreationModel) => eosReportCreationModel.currentShiftData.match({
    Loading: () => spinner(),
    Success: (shiftData) => {
        const formattedShiftDate = getLocaleDateAndTime(shiftData.shift.start, { timezone: 'Europe/Zurich' }).date;
        return [
            h('h1', `End of shift report - ${eosReportCreationModel.reportType} - ${formattedShiftDate} ${shiftData.shift.period}`),
            creationFormComponent(
                eosReportCreationModel,
                eosReportCreationForm(eosReportCreationModel.reportType, eosReportCreationModel.data, shiftData),
            ),
        ];
    },
    Failure: () => h('.mh2.mt2.alert.alert-danger', 'Unable to fetch the shift log entries'),
    NotAsked: () => null,
});
