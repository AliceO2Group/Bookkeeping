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
 * @typedef SequelizeQualityControlFlag
 *
 * @param {number} id
 * @param {number} timeStart
 * @param {number} timeEnd
 * @param {string} comment
 * @param {enum{'HUMAN', 'SYNC', 'ASYNC', 'MC'}} provenance
 * @param {number} userId
 * @param {SequelizeUser} user
 * @param {number} qualityControlFlagTypeId
 * @param {SequelizeQualityControlFlagType} type
 * @param {number} runNumber
 * @param {number} dataPassId
 * @param {number} detectorId
 * @param {SequelizeDetector} detector
 *
 * @param {number} createdAt
 *
 * @param {SequelizeQualityControlFlagVerification[]} verifications
 */
