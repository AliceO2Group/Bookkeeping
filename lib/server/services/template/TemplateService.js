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

const { templateAdapter } = require('../../../database/adapters/index.js');
const { getAllTemplates } = require('./getAllTemplates.js');
const { getTemplateOrFail } = require('./getTemplateOrFail.js');

/**
 * Global service to read presentation templates
 */
class TemplateService {
    /**
     * Return the templates sorted by title, without their modules
     *
     * Templates are not paginated, as there are only a few of them
     *
     * @return {Promise<Template[]>} the templates
     */
    async getAll() {
        return (await getAllTemplates()).map(templateAdapter.toEntity);
    }

    /**
     * Return the template with the given id, with its modules in presentation order, or reject if there is none
     *
     * @param {number} id the id of the template to find
     * @return {Promise<Template>} resolves with the template found or rejects with a NotFoundError
     */
    async getOneOrFail(id) {
        return templateAdapter.toEntity(await getTemplateOrFail(id));
    }
}

exports.TemplateService = TemplateService;

exports.templateService = new TemplateService();
