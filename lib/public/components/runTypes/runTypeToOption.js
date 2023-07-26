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
 * Convert a run type to a selection option
 *
 * @param {RunType} runType the run type to convert
 * @return {SelectionOption} the run type's option
 */
export const runTypeToOption = ({ name, id }) => ({ label: name, value: id });
