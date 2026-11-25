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

const { NotFoundError } = require('../../errors/NotFoundError.js');
const { getPresentationTemplate } = require('./getPresentationTemplate.js');

/**
 * Find a presentation template model by its id and reject with a NotFoundError if none is found
 *
 * @param {number} id the id of the template to find
 * @return {Promise<SequelizePresentationTemplate>} resolve with the template model found or reject with a NotFoundError
 */
exports.getPresentationTemplateOrFail = async (id) => {
    const presentationTemplateModel = await getPresentationTemplate(id);
    if (presentationTemplateModel !== null) {
        return presentationTemplateModel;
    } else {
        throw new NotFoundError(`Presentation template with this id (${id}) could not be found`);
    }
};
