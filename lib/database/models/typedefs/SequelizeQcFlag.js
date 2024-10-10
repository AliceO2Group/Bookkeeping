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
 * @typedef SequelizeQcFlag
 *
 * @property {number} id
 * @property {number} from
 * @property {number} to
 * @property {string} comment
 * @property {string} origin
 * @property {number} createdById
 * @property {number} flagTypeId
 * @property {number} runNumber
 * @property {number} dplDetectorId
 * @property {number} createdAt
 * @property {number} updatedAt
 * @property {SequelizeQcFlagType|null} flagType
 * @property {SequelizeUser|null} createdBy
 *
 */
