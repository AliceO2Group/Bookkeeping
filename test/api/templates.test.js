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

const { expect } = require('chai');
const request = require('supertest');
const { server } = require('../../lib/application');
const { resetDatabaseContent } = require('../utilities/resetDatabaseContent.js');

module.exports = () => {
    before(resetDatabaseContent);

    describe('GET /api/templates', () => {
        it('should return all the templates sorted by title, without their modules', async () => {
            const response = await request(server).get('/api/templates');
            expect(response.status).to.equal(200);

            const { data: templates, meta } = response.body;
            expect(meta).to.be.undefined;
            expect(templates.map(({ name }) => name)).to.eql(['lhc-fill-summary', 'run-manager-weekly-report']);
            templates.forEach((template) => expect(Object.keys(template)).to.have.members(['id', 'name', 'title', 'description']));
        });

        it('should return 400 if a pagination parameter is given', async () => {
            const response = await request(server).get('/api/templates?page[limit]=1');
            expect(response.status).to.equal(400);
        });
    });

    describe('GET /api/templates/:templateId', () => {
        it('should return the template with its modules in presentation order', async () => {
            const response = await request(server).get('/api/templates/1');
            expect(response.status).to.equal(200);

            const { data: template } = response.body;
            expect(template.name).to.equal('run-manager-weekly-report');
            expect(template.title).to.equal('Run Manager Weekly Report');
            expect(template.modules.map(({ position, type }) => [position, type])).to.eql([
                [0, 'title-slide'],
                [1, 'fill-calendar'],
                [2, 'fill-efficiency'],
                [3, 'running-time'],
                [4, 'eor-reasons'],
            ]);
            expect(template.modules[1].options).to.eql({ run_definitions: ['PHYSICS'] });
        });

        it('should return 404 if the template does not exist', async () => {
            const response = await request(server).get('/api/templates/999999');
            expect(response.status).to.equal(404);
            expect(response.body.errors).to.eql([
                { status: 404, title: 'Not found', detail: 'Template with this id (999999) could not be found' },
            ]);
        });

        it('should return 400 if the template id is not positive', async () => {
            const response = await request(server).get('/api/templates/-1');
            expect(response.status).to.equal(400);

            const { errors } = response.body;
            const idError = errors.find((error) => error.source.pointer === '/data/attributes/params/templateId');
            expect(idError.detail).to.equal('"params.templateId" must be a positive number');
        });
    });
};
