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

const { utilities: { QueryBuilder } } = require('../../../database');
const { AttachmentRepository } = require('../../../database/repositories/index.js');

/**
 * Find and return an attachment model by its id
 *
 * @param {number} id the id of the attachment to find
 * @param {Function|null} qbConfiguration function called with the attachment find query builder as parameter to add specific configuration to
 *     the query
 * @return {Promise<SequelizeAttachment|null>} the attachment found or null
 */
exports.getAttachment = (id, qbConfiguration = null) => {
    const queryBuilder = new QueryBuilder().where('id').is(id);

    if (qbConfiguration) {
        qbConfiguration(queryBuilder);
    }
    return AttachmentRepository.findOne(queryBuilder);
};
