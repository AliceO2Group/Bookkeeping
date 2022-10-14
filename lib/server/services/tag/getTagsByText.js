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

const { repositories: { TagRepository }, utilities: { QueryBuilder } } = require('../../../database');

/**
 * Return the tags that belongs to the given list of text
 *
 * @param {string[]} texts the list of texts for which tags must be retrieved
 * @returns {Promise<SequelizeTag[]>} Promise resolving with the list of tags
 */
exports.getTagsByText = async (texts) => {
    if (texts.length === 0) {
        return [];
    }

    const queryBuilder = new QueryBuilder().where('text').oneOf(...texts);

    return TagRepository.findAll(queryBuilder);
};
