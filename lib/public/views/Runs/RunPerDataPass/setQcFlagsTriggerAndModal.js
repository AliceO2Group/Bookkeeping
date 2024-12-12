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

import { h, iconWarning } from '/js/src/index.js';
import { MultipleQcFlagsCreationModel } from '../../QcFlags/Create/MultipleQcFlagsCreationModel.js';
import { multipleQcFlagsCreationComponent } from '../../QcFlags/Create/MultipleQcFlagsCreationComponent.js';
import { QcFlagCreationModel } from '../../QcFlags/Create/QcFlagCreationModel.js';

/**
 * Export form component, containing the fields to export, the export type and the export button
 *
 * @param {RunsPerDataPassOverviewModel} runsOverviewModel the runsOverviewModel
 * @param {array} flags the flags to be set
 * @param {ModalHandler} modalHandler The modal handler, used to dismiss modal after export
 *
 * @return {vnode[]} the form component
 */
const multiFlagSetForm = (runsOverviewModel, flags, modalHandler, selectedDetectors) => {    
    const qcFlagModels = selectedDetectors.map(([runId, dplDetectorId]) => {
        return new QcFlagCreationModel({ runNumber: runId, dplDetectorId }, () => {modalHandler.dismiss()});
    });

    const creationModel = new MultipleQcFlagsCreationModel(selectedDetectors, qcFlagModels);

    return multipleQcFlagsCreationComponent(creationModel);
};

// eslint-disable-next-line require-jsdoc
const errorDisplay = () => h('.danger', 'Data fetching failed');

/**
 * A function to set multiple QC flags from the runs overview page
 * @param {RunsPerDataPassOverviewModel} runsOverviewModel Pass the model to access the defined functions
 * @param {ModalHandler} modalHandler The modal handler, used to dismiss modal after setting QC flags
 * @return {Component} Return the view of the inputs
 */
const setQcFlagsModal = (runsOverviewModel, modalHandler, selectedDetectors) => {
    const runsRemoteData = runsOverviewModel.allRuns;

    return h('div#set-qc-flags', [
        h('h2', 'Set QC Flags'),
        h('p.warning', [iconWarning(), 'Warning: Existing flags will be overwritten.']),
        runsRemoteData.match({
            NotAsked: () => errorDisplay(),
            Loading: () => multiFlagSetForm(runsOverviewModel, null, modalHandler, selectedDetectors),
            Success: (payload) => multiFlagSetForm(runsOverviewModel, payload, modalHandler, selectedDetectors),
            Failure: () => errorDisplay(),
        }),
    ]);
};

/**
 * Builds a button which will open popover for setting multiple qc flags at once
 * @param {RunsPerDataPassOverviewModel} runsOverviewModel runs model
 * @param {ModelModel} modalModel modal model
 * @param {object} [displayConfiguration] additional display options
 * @param {boolean} [displayConfiguration.autoMarginLeft = true] if true margin left is set to auto, otherwise not
 * @returns {Component} button
 */

export const setQcFlagsTriggerAndModal = (runsOverviewModel, modalModel, { autoMarginLeft = true } = {}) => {
    const selectedDetectors = Array.from(document.getElementsByClassName('select-multi-flag'))
    .filter((detector) => detector.checked).map((detector) => [detector.getAttribute('runId'), detector.getAttribute('dplDetectorId')]);

    return h(`button.btn.btn-primary.w-15.h2${autoMarginLeft ? '.mlauto' : ''}#set-qc-flags-trigger`, {
        disabled: selectedDetectors.length === 0,
        onclick: () => modalModel.display({ content: (modalModel) => setQcFlagsModal(runsOverviewModel, modalModel, selectedDetectors), size: 'medium' }),
    }, 'Set QC Flags');
}
