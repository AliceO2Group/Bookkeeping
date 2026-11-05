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
 * Convert a raw configuration key to a selection option
 * The raw key value is best for mapping to the configuration
 *
 * @param {string} key the key to convert
 * @return {SelectionOption} the key's option
 */
export const keyToOption = (key) => ({ label: key, value: key });
