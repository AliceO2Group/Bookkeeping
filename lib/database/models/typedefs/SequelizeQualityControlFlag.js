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
 * @property {number} id
 * @property {number} timeStart
 * @property {number} timeEnd
 * @property {string} comment
 * @property {{'HUMAN', 'SYNC', 'ASYNC', 'MC'}} provenance
 * @property {number} userId
 * @property {SequelizeUser} user
 * @property {number} flagReasonId
 * @property {SequelizeQualityControlFlagReason} flagReason
 * @property {number} runNumber
 * @property {number} dataPassId
 * @property {number} detectorId
 *
 * @property {number} createdAt
 *
 * @property {SequelizeQualityControlFlagVerification[]} verifications
 */
