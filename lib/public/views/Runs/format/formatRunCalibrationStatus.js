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

import { h } from '/js/src/index.js';
import { RUN_CALIBRATION_STATUS } from '../../../domain/enums/RunCalibrationStatus.js';
import { coloredCalibrationStatusComponent } from '../coloredCalibrationStatusComponent.js';

/**
 * Format a given run calibration's status
 *
 * @param {RunDetailsModel} runDetailsModel the details model
 * @param {Run} run the run for which calibration's status must be formatted
 * @return {Component} the calibration status view
 */
export const formatRunCalibrationStatus = (runDetailsModel, run) => {
    const { calibrationStatus } = run;
    if (calibrationStatus === null) {
        return null;
    }

    if (runDetailsModel.isEditModeEnabled) {
        return h(
            'select.form-control.w-unset',
            {
                onchange: ({ target }) => {
                    runDetailsModel.runPatch.calibrationStatus = target.value;
                },
            },
            RUN_CALIBRATION_STATUS.map((calibrationStatus) => h(
                `option#run-calibration-status-${calibrationStatus}`,
                {
                    value: calibrationStatus, selected: runDetailsModel.runPatch.calibrationStatus === calibrationStatus,
                },
                calibrationStatus,
            )),
        );
    } else {
        return coloredCalibrationStatusComponent(calibrationStatus);
    }
};
