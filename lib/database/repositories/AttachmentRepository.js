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

const { AttachmentAdapter } = require('../adapters');
const {
    models: {
        Attachment,
        Log,
    },
    utilities: {
        QueryBuilder,
    },
} = require('../');

/**
 * Attachment repository
 */
class AttachmentRepository {
    /**
     * Returns the total number of entities.
     *
     * @returns {Promise<number>} Promise object representing the total number of entities.
     */
    async count() {
        return AttachmentRepository.count();
    }

    /**
     * Returns all entities.
     *
     * @param {Object} queryBuilder The QueryBuilder to use.
     * @returns {Promise} Promise object representing the full mock data.
     */
    async findAll(queryBuilder) {
        return Attachment.findAll(queryBuilder.toImplementation()).map(AttachmentAdapter.toEntity);
    }

    /**
     * Returns all entities queried by log id.
     *
     * @param {number} logId the id to query on.
     * @param {Object} queryBuilder The QueryBuilder to use.
     * @returns {Promise} Promise object representing the full mock data
     */
    async findAllByLogId(logId, queryBuilder = new QueryBuilder()) {
        queryBuilder.include({
            model: Log,
            as: 'log',
            required: true,
            through: { where: { log_id: logId } },
        });
        return this.findAll(queryBuilder);
    }

    /**
     * Find one model.
     *
     * @param {Object} queryBuilder The Querybuilder to use.
     * @returns {Object|null} model or null
     */
    async findOne(queryBuilder) {
        queryBuilder.limit(1);
        const result = await Attachment.findOne(queryBuilder.toImplementation());
        return result ? AttachmentAdapter.toEntity(result) : null;
    }

    /**
     * Insert entity.
     *
     * @param {Object} entity entity to insert.
     * @returns {Promise} Promise object represents the just inserted Attachment.
     */
    async insert(entity) {
        const result = await Attachment.create(AttachmentAdapter.toDatabase(entity));
        return AttachmentAdapter.toEntity(result);
    }
}

module.exports = new AttachmentRepository();
