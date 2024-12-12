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

/**
 * Export form component, containing the fields to export, the export type and the export button
 *
 * @param {RunsPerDataPassOverviewModel} runsOverviewModel the runsOverviewModel
 * @param {array} flags the flags to be set
 * @param {ModalHandler} modalHandler The modal handler, used to dismiss modal after export
 *
 * @return {vnode[]} the form component
 */
const multiFlagSetForm = (runsOverviewModel, flags, modalHandler) => {
    return []
};

// eslint-disable-next-line require-jsdoc
const errorDisplay = () => h('.danger', 'Data fetching failed');

/**
 * A function to set multiple QC flags from the runs overview page
 * @param {RunsPerDataPassOverviewModel} runsOverviewModel Pass the model to access the defined functions
 * @param {ModalHandler} modalHandler The modal handler, used to dismiss modal after setting QC flags
 * @return {Component} Return the view of the inputs
 */
const setQcFlagsModal = (runsOverviewModel, modalHandler) => {
    const runsRemoteData = runsOverviewModel.allRuns;

    return h('div#set-qc-flags', [
        h('h2', 'Set QC Flags'),
        runsRemoteData.match({
            NotAsked: () => errorDisplay(),
            Loading: () => multiFlagSetForm(runsOverviewModel, null, modalHandler),
            Success: (payload) => multiFlagSetForm(runsOverviewModel, payload, modalHandler),
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
    // Get all detectors that have been selected with class 'select-multi-flag' and are selected
    const selectedDetectors = Array.from(document.getElementsByClassName('select-multi-flag')).filter((detector) => detector.checked).map((detector) => detector.id);
    console.log(selectedDetectors.length);

    return h(`button.btn.btn-primary.w-15.h2${autoMarginLeft ? '.mlauto' : ''}#set-qc-flags-trigger`, {
        disabled: selectedDetectors.length === 0,
        onclick: () => modalModel.display({ content: (modalModel) => setQcFlagsModal(runsOverviewModel, modalModel, selectedDetectors), size: 'medium' }),
    }, 'Set QC Flags');
}