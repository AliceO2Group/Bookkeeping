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
 * @typedef DataPassVersion
 *
 * @property {number} id
 * @property {number} dataPassId
 * @property {string} description
 * @property {number} outputSize
 * @property {number} reconstructedEventsCount - expected to be up to a value of 1e13, thus BIGINT definition is needed in SQL but not in JS
 * @property {number} lastSeen
 * @property {boolean} deletedFromMonAlisa
 *
 * @property {number} createdAt
 * @property {number} updatedAt
 */
