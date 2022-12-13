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
 * Returns true if the two given arrays has strictly equals items at the same index
 *
 * @param {array} first the first array to compare
 * @param {array} second the second array to compare
 *
 * @return {boolean} true if the arrays has the same content
 */
export const arrayHasSameContent = (first, second) => first.every((item, index) => item === second[index]);
