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
const PresentationTemplateRepository = require('../../../database/repositories/PresentationTemplateRepository.js');

/**
 * Return the list of all the presentation templates, sorted by title
 *
 * @return {Promise<SequelizePresentationTemplate[]>} Promise resolving with the list of presentation templates
 */
exports.getAllPresentationTemplates = () => {
    const queryBuilder = new QueryBuilder();
    queryBuilder.orderBy('title', 'ASC');
    return PresentationTemplateRepository.findAll(queryBuilder);
};
