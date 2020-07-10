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

import titleFilter from '../../../components/Filters/title.js';
import authorFilter from '../../../components/Filters/author.js';
import creationTimeFilter from '../../../components/Filters/created.js';
import tagsFilter from '../../../components/Filters/tags.js';

/**
 * Method to retrieve the list of active columns for a generic table component
 * @param {Object} model The global model object
 * @return {Object} A collection of columns with parameters for the Log table
 */
const activeColumns = (model) => ({
    id: {
        name: 'Entry ID',
        visible: false,
        primary: true,
    },
    title: {
        name: 'Title',
        visible: true,
        size: 'cell-l',
        expand: true,
        filter: titleFilter(),
    },
    author: {
        name: 'Author',
        visible: true,
        size: 'cell-l',
        format: (author) => author.name,
        filter: authorFilter(),
    },
    createdAt: {
        name: 'Created',
        visible: true,
        size: 'cell-l',
        format: (date) => new Date(date).toLocaleString(),
        filter: creationTimeFilter(),
    },
    tags: {
        name: 'Tags',
        visible: true,
        size: 'cell-m',
        format: (tags) => tags.map(({ text }) => text).join(', '),
        filter: tagsFilter(model),
    },
    attachments: {
        name: 'File Attachments',
        visible: true,
        size: 'cell-l',
    },
});

export default activeColumns;
