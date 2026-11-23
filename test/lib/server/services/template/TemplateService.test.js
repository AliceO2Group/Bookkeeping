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

const { templateService } = require('../../../../../lib/server/services/template/TemplateService.js');
const { NotFoundError } = require('../../../../../lib/server/errors/NotFoundError.js');
const { expect } = require('chai');

module.exports = () => {
    it('should successfully return all the templates sorted by title, without their modules', async () => {
        const templates = await templateService.getAll();

        expect(templates.map(({ title }) => title)).to.eql(['LHC Fill Summary', 'Run Manager Weekly Report']);
        templates.forEach((template) => expect(template).to.not.have.property('modules'));
    });

    it('should successfully return a template by id with its modules in presentation order', async () => {
        const template = await templateService.getOneOrFail(2);

        expect(template.name).to.equal('lhc-fill-summary');
        expect(template.modules.map(({ type }) => type)).to.eql(['title-slide', 'fill-calendar', 'fill-efficiency']);
    });

    it('should fail with a not found error when the template does not exist', async () => {
        const error = await templateService.getOneOrFail(999999).catch((error) => error);
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.equal('Template with this id (999999) could not be found');
    });
};
