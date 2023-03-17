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

const { utilities: { QueryBuilder } } = require('../');

/**
 * Sequelize implementation of the Repository.
 */
class Repository {
    /**
     * Creates a new `Repository` instance.
     *
     * @param {Object} model The database model to use.
     */
    constructor(model) {
        this.model = model;
    }

    /**
     * Returns the total number of entities.
     *
     * @param {QueryBuilder} queryBuilder The QueryBuilder to use.
     * @returns {Promise<Number>} Promise object representing the total number of entities.
     */
    async count(queryBuilder = new QueryBuilder()) {
        return this.model.count(queryBuilder.toImplementation());
    }

    /**
     * Returns all entities.
     *
     * @param {Object|QueryBuilder} findQuery the find query (see sequelize findAll options) or a find query builder
     * @returns {Promise<array>} Promise object representing the full mock data
     */
    async findAll(findQuery = {}) {
        return this.model.findAll(findQuery instanceof QueryBuilder ? findQuery.toImplementation() : findQuery);
    }

    /**
     * Returns all entities.
     *
     * @param {QueryBuilder} queryBuilder The QueryBuilder to use.
     * @returns {Promise} Promise object representing the full mock data
     */
    async findAndCountAll(queryBuilder = new QueryBuilder()) {
        queryBuilder.set('distinct', true);
        return this.model.findAndCountAll(queryBuilder.toImplementation());
    }

    /**
     * Returns a specific entity.
     *
     * @param {QueryBuilder} queryBuilder The QueryBuilder to use.
     * @returns {Promise<Object>|null} Promise object representing the full mock data
     */
    async findOne(queryBuilder = new QueryBuilder()) {
        queryBuilder.limit(1);
        return this.model.findOne(queryBuilder.toImplementation());
    }

    /**
     * Insert entity.
     *
     * @param {Object} entity entity to insert.
     * @returns {Promise} Promise object represents the just inserted this.model.
     */
    async insert(entity) {
        return this.model.create(entity);
    }

    /**
     * Removes a specific entity.
     *
     * @param {QueryBuilder} queryBuilder The QueryBuilder to use.
     * @returns {Promise|Null} Promise object representing the full mock data
     */
    async removeOne(queryBuilder = new QueryBuilder()) {
        queryBuilder.limit(1);

        const entity = await this.findOne(queryBuilder);
        if (entity) {
            await this.model.destroy(queryBuilder.toImplementation());
        }

        return entity;
    }

    /**
     * Apply a patch on a given model and save the model to the database
     *
     * @param {Object} model the model on which to apply the patch
     * @param {Object} patch the patch to apply
     * @param {Object} [transaction] transaction to run query under
     * @return {Promise<void>} promise that resolves when the patch has been applied
     */
    async update(model, patch) {
        return model.update(patch);
    }
}

module.exports = Repository;
