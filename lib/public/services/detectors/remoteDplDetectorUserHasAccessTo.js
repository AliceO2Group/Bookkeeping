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

/**
 * Return a RemoteData of the detector for a given ID if the user has access to it
 *
 * If the user do not have access to the given detector, remote data will be success with null payload
 *
 * @param {number} detectorId id of the detector that should be returned
 * @param {RemoteData<DplDetector[]>} remoteDplDetectorsUserHasAccessTo dpl detectors list remote data
 * @return {RemoteData} remote data of the detector
 */
export const remoteDplDetectorUserHasAccessTo = (detectorId, remoteDplDetectorsUserHasAccessTo) => remoteDplDetectorsUserHasAccessTo.apply({
    Success: (detectors) => detectors.find(({ id }) => id === detectorId) ?? null,
    Failure: () => `An error has occurred, unable to check if the user has access to the detector ${detectorId}`,
});
