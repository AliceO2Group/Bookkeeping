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
 * Method to retrieve the list of active columns for a generic table component
 * @param {Object} model The global model object
 * @return {Object} A collection of columns with parameters for the Tag table
 */
const activeColumns = () => ({
    id: {
        name: 'Entry ID',
        visible: true,
        size: 'cell-l',
        primary: true,
        sortable: true,
    },
    text: {
        name: 'Name',
        visible: true,
        size: 'cell-l',
        sortable: true,
    },
});

export default activeColumns;
