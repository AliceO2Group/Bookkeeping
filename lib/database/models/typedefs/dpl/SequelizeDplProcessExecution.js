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
 * @typedef SequelizeDplProcessExecution
 * @property {number} id
 * @property {number} detectorId
 * @property {string} hostId
 * @property {string} processId
 * @property {number} runNumber
 * @property {string} arguments
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {SequelizeDplDetector|null} detector
 * @property {SequelizeHost|null} host
 * @property {SequelizeDplProcess|null} process
 * @property {SequelizeRun|null} run
 */
