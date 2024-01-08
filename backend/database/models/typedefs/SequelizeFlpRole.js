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

/**
 * @typedef SequelizeFlpRole
 *
 * @property {number} id
 * @property {number} runNumber
 * @property {string|null} name
 * @property {string|null} hostname
 * @property {number|null} nTimeframes
 * @property {number|null} bytesProcessed
 * @property {number|null} bytesEquipmentReadOut
 * @property {number|null} bytesRecordingReadOut
 * @property {number|null} bytesFairMQReadOut
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {SequelizeRun|null} run
 */
