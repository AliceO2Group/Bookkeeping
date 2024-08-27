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

import { formatItemsCount } from '../../../utilities/formatting/formatItemsCount.js';
import { h } from '/js/src/index.js';
import { formatBoolean } from '../../../utilities/formatting/formatBoolean.js';
import { editRunEorReasons } from '../format/editRunEorReasons.js';
import { displayRunEorReasons } from '../format/displayRunEorReasons.js';
import { formatFileSize } from '../../../utilities/formatting/formatFileSize.js';
import { formatRunCalibrationStatus } from '../format/formatRunCalibrationStatus.js';
import { formatEditableNumber } from '../format/formatEditableNumber.js';
import { formatFloat } from '../../../utilities/formatting/formatFloat.js';
import { RunDefinition } from '../../../domain/enums/RunDefinition.js';

const GREEK_LOWER_MU_ENCODING = '\u03BC';

/**
 * Returns the configuration to display a given run
 *
 * @param {RunDetailsModel} runDetailsModel the model storing the run details state
 * @return {Object} A collection of data with parameters for the Run detail page.
 */
export const runDetailsConfiguration = (runDetailsModel) => ({
    calibrationStatus: {
        name: 'Calibration status',
        visible: (calibrationStatus) => calibrationStatus !== null,
        format: (calibrationStatus, run) => formatRunCalibrationStatus(runDetailsModel, run),
    },
    muInelasticInteractionRate: {
        name: `${GREEK_LOWER_MU_ENCODING}(INEL)`,
        visible: (_, { pdpBeamType, definition }) => pdpBeamType === 'pp' && definition === RunDefinition.Physics,
        format: formatFloat,
    },
    inelasticInteractionRateAvg: {
        name: ['INEL', h('sub', 'avg')],
        visible: (_, { definition }) => definition === RunDefinition.Physics,
        format: () => formatEditableNumber(
            runDetailsModel.isEditModeEnabled,
            runDetailsModel.runPatch.formData.inelasticInteractionRateAvg,
            ({ target: { value: inelasticInteractionRateAvg } }) =>
                runDetailsModel.runPatch.patchFormData({ inelasticInteractionRateAvg }),
            { unit: 'Hz' },
        ),
    },
    inelasticInteractionRateAtStart: {
        name: ['INEL', h('sub', 'start')],
        visible: (_, { pdpBeamType, definition }) => pdpBeamType === 'PbPb' && definition === RunDefinition.Physics,
        format: () => formatEditableNumber(
            runDetailsModel.isEditModeEnabled,
            runDetailsModel.runPatch.formData.inelasticInteractionRateAtStart,
            ({ target: { value: inelasticInteractionRateAtStart } }) =>
                runDetailsModel.runPatch.patchFormData({ inelasticInteractionRateAtStart }),
            { unit: 'Hz' },
        ),
    },
    inelasticInteractionRateAtMid: {
        name: ['INEL', h('sub', 'mid')],
        visible: (_, { pdpBeamType, definition }) => pdpBeamType === 'PbPb' && definition === RunDefinition.Physics,
        format: () => formatEditableNumber(
            runDetailsModel.isEditModeEnabled,
            runDetailsModel.runPatch.formData.inelasticInteractionRateAtMid,
            ({ target: { value: inelasticInteractionRateAtMid } }) =>
                runDetailsModel.runPatch.patchFormData({ inelasticInteractionRateAtMid }),
            { unit: 'Hz' },
        ),
    },
    inelasticInteractionRateAtEnd: {
        name: ['INEL', h('sub', 'end')],
        visible: (_, { pdpBeamType, definition }) => pdpBeamType === 'PbPb' && definition === RunDefinition.Physics,
        format: () => formatEditableNumber(
            runDetailsModel.isEditModeEnabled,
            runDetailsModel.runPatch.formData.inelasticInteractionRateAtEnd,
            ({ target: { value: inelasticInteractionRateAtEnd } }) =>
                runDetailsModel.runPatch.patchFormData({ inelasticInteractionRateAtEnd }),
            { unit: 'Hz' },
        ),
    },
    otherFileSize: {
        name: 'Other File Size',
        visible: false,
        format: formatFileSize,
    },
    eorReasons: {
        name: 'EOR Reasons',
        visible: true,
        format: (eorReasons) => runDetailsModel.isEditModeEnabled
            ? editRunEorReasons(runDetailsModel)
            : displayRunEorReasons(eorReasons),
    },
});
