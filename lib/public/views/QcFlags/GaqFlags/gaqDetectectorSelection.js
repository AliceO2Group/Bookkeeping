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
import { picker } from '../../../components/common/selection/picker/picker.js';

/**
 * Export form component, containing the fields to export, the export type and the export button
 *
 * @param {RunsOverviewModel} gaqOverviewModel the runsOverviewModel
 * @param {array} gaqDetectors the runs to export
 * @param {ModalHandler} modalHandler The modal handler, used to dismiss modal after export
 *
 * @return {vnode[]} the form component
 */
const selectionForm = (gaqOverviewModel, gaqDetectors, modalHandler) => {
    const { gaqDetectorPickerModel } = gaqOverviewModel;

    return [
        picker(
            gaqDetectors,
            gaqDetectorPickerModel,
            {
                selector: 'gaq-detectors',
                limit: null,
                attributes: { class: 'scroll-y grid columns-2-lg columns-3-xl g2' },
                outlineSelection: true,
                searchEnabled: false,
            },
        ),
        h('button.shadow-level1.btn.btn-success.mt2#send', {
            onclick: async () => {
                modalHandler.dismiss();
            },
        }, gaqDetectors ? 'Submit' : 'Loading data'),
    ];
};

// eslint-disable-next-line require-jsdoc
const errorDisplay = () => h('.danger', 'Data fetching failed');

/**
 * A function to construct the exports runs screen
 * @param {RunsOverviewModel} gaqOverviewModel Pass the model to access the defined functions
 * @param {ModalHandler} modalHandler The modal handler, used to dismiss modal after export
 * @return {Component} Return the view of the inputs
 */
const gaqDetectorsSelectionModal = (gaqOverviewModel, modalHandler) => {
    gaqOverviewModel.updateDetectorSelectionModel();

    const { gaqDetectorPickerModel } = gaqOverviewModel;

    return h('div#export-runs-modal', [
        h('h2', 'GAQ detectors selection'),
        gaqDetectorPickerModel.options.match({
            NotAsked: () => errorDisplay(),
            Loading: () => selectionForm(gaqOverviewModel, null, modalHandler),
            Success: (payload) => selectionForm(gaqOverviewModel, payload, modalHandler),
            Failure: () => errorDisplay(),
        }),
    ]);
};

/**
 * Builds a button which will open popover for data export
 * @param {GaqOverviewModel} gaqOverviewModel overview model
 * @param {ModelModel} modalModel modal model
 * @param {object} [displayConfiguration] additional display options
 * @param {boolean} [displayConfiguration.autoMarginLeft = true] if true margin left is set to auto, otherwise not
 * @returns {Component} button
 */
export const gaqDetectorsTrigger = (gaqOverviewModel, modalModel, { autoMarginLeft = true } = {}) =>
    h(`button.btn.btn-primary.w-15.h2${autoMarginLeft ? '.mlauto' : ''}#export-runs-trigger`, {
        disabled: gaqOverviewModel.gaqDetectors.match({
            Success: () => false,
            NotAsked: () => true,
            Failure: () => true,
            Loading: () => true,
        }),
        onclick: () => modalModel.display({ content: (modalModel) => gaqDetectorsSelectionModal(gaqOverviewModel, modalModel), size: 'medium' }),
    }, 'Set GAQ Dets');
