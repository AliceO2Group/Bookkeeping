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
const TemplateRepository = require('../../../database/repositories/TemplateRepository.js');

/**
 * Find and return a template model, with its modules in presentation order, by its id
 *
 * @param {number} id the id of the template to find
 * @return {Promise<SequelizeTemplate|null>} the template found or null
 */
exports.getTemplate = (id) => {
    const queryBuilder = new QueryBuilder();

    queryBuilder.where('id').is(id);
    queryBuilder.include('modules');
    queryBuilder.orderBy('position', 'ASC', 'modules');

    return TemplateRepository.findOne(queryBuilder);
};
