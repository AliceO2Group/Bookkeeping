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
import { qcFlagCreationComponent } from '../../QcFlags/Create/qcFlagCreationComponent.js';

/**
 * Export form component, containing the fields to export, the export type and the export button
 *
 * @param {RunsOverviewModel} runsOverviewModel the runsOverviewModel
 * @param {array} runs the runs to export
 * @param {ModalHandler} modalHandler The modal handler, used to dismiss modal after export
 *
 * @return {vnode[]} the form component
 */
const exportForm = (runsOverviewModel, runs, modalHandler) => {
    console.log(runsOverviewModel);
    return [
        // return the qc flag creation form
        qcFlagCreationComponent(runsOverviewModel),
    ];
};

// eslint-disable-next-line require-jsdoc
const errorDisplay = () => h('.danger', 'Data fetching failed');

/**
 * A function to construct the exports runs screen
 * @param {RunsOverviewModel} runsOverviewModel Pass the model to access the defined functions
 * @param {ModalHandler} modalHandler The modal handler, used to dismiss modal after export
 * @return {Component} Return the view of the inputs
 */
const exportQcFlagsModal = (runsOverviewModel, modalHandler) => {
    const runsRemoteData = runsOverviewModel.allRuns;

    return h('div#export-runs-modal', [
        h('h2', 'Export QC Flags'),
        runsRemoteData.match({
            NotAsked: () => errorDisplay(),
            Loading: () => exportForm(runsOverviewModel, null, modalHandler),
            Success: (payload) => exportForm(runsOverviewModel, payload, modalHandler),
            Failure: () => errorDisplay(),
        }),
    ]);
};

/**
 * Builds a button which will open popover for data export
 * @param {RunsOverviewModel} runsModel runs overview model
 * @param {ModelModel} modalModel modal model
 * @param {object} [displayConfiguration] additional display options
 * @param {boolean} [displayConfiguration.autoMarginLeft = true] if true margin left is set to auto, otherwise not
 * @returns {Component} button
 */
export const exportQcFlagsTriggerAndModal = (runsModel, modalModel, { autoMarginLeft = true } = {}) =>
    h(`button.btn.btn-primary.w-15.h2${autoMarginLeft ? '.mlauto' : ''}#export-runs-trigger`, {
        disabled: runsModel.items.match({
            Success: (payload) => payload.length === 0,
            NotAsked: () => true,
            Failure: () => true,
            Loading: () => true,
        }),
        onclick: () => modalModel.display({ content: (modalModel) => exportQcFlagsModal(runsModel, modalModel), size: 'medium' }),
    }, 'Export QC Flags');
