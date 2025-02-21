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
 * Return a subset of options for which label/value matches a given search text
 *
 * @param {SelectionOption[]} options options the list of options to filter
 * @param {string} substring the substring that options must match
 * @return {SelectionOption[]} the filtered options
 */
export const filterSelectionOptions = (options, substring) => {
    /**
     * Apply the current search filtering on option
     *
     * @param {SelectionOption} option the option to filter
     * @return {boolean} true if the option matches the current search
     */
    const filter = substring
        ? ({ rawLabel, label, value }) => (rawLabel || label || value).toUpperCase().includes(substring.toUpperCase())
        : null;

    return filter ? options.filter(filter) : options;
};
