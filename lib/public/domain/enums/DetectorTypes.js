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

export const DetectorType = Object.freeze({
    PHYSICAL: 'PHYSICAL',
    QC_ONLY: 'QC',
    VIRTUAL: 'VIRTUAL',
    OTHER: 'OTHER',
});

export const DETECTOR_TYPES = Object.values(DetectorType);

/**
 * Any detector that might be used in AliECS configuration
 */
export const DATA_TAKING_DETECTOR_TYPES = [DetectorType.PHYSICAL, DetectorType.VIRTUAL];
