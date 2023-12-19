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
import { RunCalibrationStatus } from '../../domain/enums/RunCalibrationStatus.js';
import { h } from '@aliceo2/web-ui-frontend';

/**
 * Return a colored component representing a given calibration status
 *
 * @param {string} calibrationStatus the calibration status to represent
 * @return {vnode} the calibration status component
 */
export const coloredCalibrationStatusComponent = (calibrationStatus) => h('.badge.white', {
    class: (() => {
        if (calibrationStatus === RunCalibrationStatus.SUCCESS) {
            return 'bg-success';
        } else if (calibrationStatus === RunCalibrationStatus.FAILED) {
            return 'bg-danger';
        }
        return 'bg-gray-darker';
    })(),
}, calibrationStatus);
