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

const ACTIVE_COLUMNS = {
    title: {
        name: 'Title',
        visible: true,
        size: 'cell-l',
    },
    id: {
        name: 'Entry ID',
        visible: true,
        size: 'cell-l',
        primary: true,
    },
    author: {
        name: 'Author',
        visible: true,
        size: 'cell-l',
        format: (author) => author.name,
    },
    createdAt: {
        name: 'Creation Time',
        visible: true,
        size: 'cell-l',
        format: (date) => new Date(date).toLocaleString(),
    },
    origin: {
        name: 'Origin',
        visible: true,
        size: 'cell-m',
    },
    subtype: {
        name: 'Subtype',
        visible: true,
        size: 'cell-m',
    },
    tags: {
        name: 'Tags',
        visible: true,
        size: 'cell-m',
        format: (tags) => tags.map(({ text }) => text).join(', '),
    },
};

export default ACTIVE_COLUMNS;
