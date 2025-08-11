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

const DetectorType = Object.freeze({
    PHYSICAL: 'PHYSICAL',
    QC_ONLY: 'QC',
    AOT_GLO: 'AOT-GLO',
    AOT_EVENT: 'AOT-EVENT',
    MUON_GLO: 'MOUN-GLO',
    VIRTUAL: 'VIRTUAL',
    OTHER: 'OTHER',
});

const DETECTOR_TYPES = Object.values(DetectorType);

/**
 * Any detector that might be used in AliECS configuration
 */
const DATA_TAKING_DETECTOR_TYPES = [DetectorType.PHYSICAL, DetectorType.VIRTUAL];

module.exports = {
    DetectorType,
    DETECTOR_TYPES,
    DATA_TAKING_DETECTOR_TYPES,
};
