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
import errorAlert from '../../../components/common/errorAlert.js';
import spinner from '../../../components/common/spinner.js';

/**
 * Form for GAQ detectors selection
 *
 * @param {GaqOverviewModel} gaqOverviewModel gaq overview model
 * @param {SelectOption[]} gaqDetectorsOptions all detector selection options
 * @param {ModalHandler} modalHandler The modal handler, used to dismiss modal after export
 *
 * @return {Component} the form component
 */
const selectionForm = (gaqOverviewModel, gaqDetectorsOptions, modalHandler) => {
    const { gaqDetectorPickerModel, submitResult: remoteSubmitResult } = gaqOverviewModel;
    const sendingRequest = remoteSubmitResult.match({
        Loading: () => true,
        Other: () => false,
    });

    return h('.flex-column.g3', [
        remoteSubmitResult.match({
            Failure: (errors) => errorAlert(errors),
            Other: () => null,
        }),
        picker(
            gaqDetectorsOptions,
            gaqDetectorPickerModel,
            {
                selector: 'gaq-detectors',
                limit: null,
                attributes: { class: 'grid columns-2-lg columns-3-xl g2' },
                optionsAttributes: { class: 'f3', disabled: sendingRequest },
                outlineSelection: true,
                searchEnabled: false,
                onremove: () => gaqOverviewModel.reset(),
            },
        ),

        h('.flex-row.g3.justify-center ', [
            h(
                'button.shadow-level1.btn.btn-success.mt2#send',
                {
                    disabled: sendingRequest,
                    onclick: async () => gaqOverviewModel.submitNewGaqDetectors(),
                },
                !sendingRequest ? 'Submit' : 'Sending...',
            ),
            h(
                'button.shadow-level1.btn.mt2#revert',
                {
                    disabled: sendingRequest,
                    onclick: async () => {
                        gaqDetectorPickerModel.reset();
                        gaqDetectorPickerModel.notify();
                    },
                },
                'Revert',
            ),
        ]),
        remoteSubmitResult.match({
            Success: () => {
                modalHandler.dismiss();
                gaqOverviewModel.dismissSubmitResult();
            },
            Loading: () => spinner({ size: 3, absolute: false }),
            Other: () => null,
        }),
    ]);
};

// eslint-disable-next-line require-jsdoc
const errorDisplay = () => h('.danger', 'Data fetching failed');

/**
 * Render GAQ detectors selection modal
 * @param {RunsOverviewModel} gaqOverviewModel GAQ overview model
 * @param {ModalHandler} modalHandler The modal handler, used to dismiss modal
 * @return {Component} modal
 */
const gaqDetectorsSelectionModal = (gaqOverviewModel, modalHandler) => {
    const { gaqDetectorPickerModel } = gaqOverviewModel;

    return h('div#gaq-detector-selection-modal', [
        h('h2', 'GAQ detectors selection'),
        gaqDetectorPickerModel.options.match({
            NotAsked: () => errorDisplay(),
            Loading: () => selectionForm(gaqOverviewModel, null, modalHandler),
            Success: (options) => selectionForm(gaqOverviewModel, options, modalHandler),
            Failure: () => errorDisplay(),
        }),
    ]);
};

/**
 * Render buttons which triggers rendering of GAQ selection modal
 * @param {GaqOverviewModel} gaqOverviewModel overview model
 * @param {ModelModel} modalModel modal model
 * @param {object} [displayConfiguration] additional display options
 * @param {boolean} [displayConfiguration.autoMarginLeft = true] if true margin left is set to auto, otherwise not
 * @returns {Component} button
 */
export const gaqDetectorsSelectionModalTrigger = (gaqOverviewModel, modalModel, { autoMarginLeft = true } = {}) =>
    h(`button.btn.btn-primary.w-15.h2${autoMarginLeft ? '.mlauto' : ''}#gaq-detectors-selection-trigger`, {
        disabled: gaqOverviewModel.gaqDetectors.match({
            Success: () => false,
            NotAsked: () => true,
            Failure: () => true,
            Loading: () => true,
        }),
        onclick: () => modalModel.display({ content: (modalModel) => gaqDetectorsSelectionModal(gaqOverviewModel, modalModel), size: 'medium' }),
    }, 'Set GAQ Detectors');
