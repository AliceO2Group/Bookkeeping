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
 * @typedef DplDetector
 * @property {number} id
 * @property {string} name
 * @property {number} createdAt
 * @property {number} updatedAt
 * @property {DplProcessExecution[]} processesExecutions
 */

/**
 * @typedef DplDetectorIdentifier object to uniquely identify a dpl detector
 * @property {number} [dplDetectorId] the id of the detector
 * @property {string} [dplDetectorName] the name of the dpl detector
 */
