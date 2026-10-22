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
const { BadParameterError } = require('../../errors/BadParameterError.js');

/**
 * @typedef TagIdentifier object to uniquely identify a tag
 * @property {string} [text] the text of the tag
 * @property {number} [id] the id of the tag, ignored if text is present
 */

/**
 * Find and return a tag model by its text or id
 *
 * @param {TagIdentifier} identifier the criteria to find the tag
 * @param {Function|null} [qbConfiguration] function called with the tag find query builder as parameter to add specific configuration to the
 *     query
 * @return {Promise<SequelizeTag|null>} the tag found or null
 */
exports.getTag = ({ text, id }, qbConfiguration = null) => {
    const queryBuilder = new QueryBuilder();

    if (text !== undefined) {
        queryBuilder.where('text').is(text);
    } else if (id !== undefined) {
        queryBuilder.where('id').is(id);
    } else {
        throw new BadParameterError('Can not find without tag id or text');
    }

    if (qbConfiguration) {
        qbConfiguration(queryBuilder);
    }
    return TagRepository.findOne(queryBuilder);
};
