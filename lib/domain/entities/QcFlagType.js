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
 * @typedef QcFlagType
 *
 * @property {number} id
 * @property {string} name
 * @property {string} method
 * @property {boolean} bad
 * @property {string} color as hex
 * @property {boolean} mcReproducible
 * @property {boolean} archived
 * @property {number} archivedAt
 * @property {number} createdById
 * @property {number} lastUpdatedById
 * @property {number} createdAt
 * @property {number} updatedAt
 * @property {User} createdBy
 * @property {QcFlagVerification[]} verifications
 * @property {User} lastUpdatedBy
 */

/**
 * @typedef MinifiedQcFlagType
 *
 * @property {string} name
 * @property {string} color as hex
 */
