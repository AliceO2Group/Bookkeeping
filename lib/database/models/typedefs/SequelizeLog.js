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
 * @typedef SequelizeLog
 *
 * @property {number} id
 * @property {string} title
 * @property {string} text
 * @property {string} subtype
 * @property {string} origin
 * @property {string} announcementValidUntil
 * @property {number|null} parentLogId
 * @property {number|null} rootLogId
 * @property {string} createdAt
 * @property {string} updatedAt
 * @property {SequelizeUser|null} user
 * @property {SequelizeLog|null} rootLog
 * @property {SequelizeLog|null} parentLog
 * @property {SequelizeRun[]|null} runs
 * @property {SequelizeTag[]|null} tags
 * @property {SequelizeSubsystem[]|null} subsystems
 * @property {SequelizeAttachment[]|null} attachments
 */
