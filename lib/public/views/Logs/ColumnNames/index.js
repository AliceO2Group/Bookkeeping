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
 * Get the corresponding key and column name with the correct spelling
 * @param {String} item Unconverted subkey passed
 * @returns {String} converted column name to add to the headers array
 */
const getColumnName = (item) => {
    switch (item){
        case 'title':
            return 'Title';
        case 'entryId':
            return 'Entry ID';
        case 'authorID':
            return 'Author';
        case 'creationTime':
            return 'Creation Time';
        case 'origin':
            return 'Origin';
        case 'subtype':
            return 'Subtype';
        default:
            break;
    }
};

export default getColumnName;
