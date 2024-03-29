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
 * @typedef DplProcess
 * @property {number} id
 * @property {string} name
 * @property {number} typeId
 * @property {number} createdAt
 * @property {number} updatedAt
 * @property {DplProcessType|null} type
 * @property {DplProcessExecution[]} processesExecutions
 */

/**
 * @typedef DplProcessIdentifier object to uniquely identify a DPL process, either by its id either by is name and its type
 * @property {number} [dplProcessId] the id of the DPL process
 * @property {string} [dplProcessName] the name of the DPL process
 * @property {number} [dplProcessTypeId] the id of the type of the DPL process
 */
