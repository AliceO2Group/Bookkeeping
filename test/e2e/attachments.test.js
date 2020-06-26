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

const path = require('path');
const chai = require('chai');
const request = require('supertest');
const chaiResponseValidator = require('chai-openapi-response-validator');

chai.use(chaiResponseValidator(path.resolve(__dirname, '..', '..', 'spec', 'openapi.yaml')));

module.exports = () => {
    const { server } = require('../../lib/application');

    describe('POST /api/attachments', () => {
        it('should return 200', (done) => {
            request(server)
                .post('/api/attachments')
                .set('log', '1')
                .attach('attachments', path.resolve(__dirname, '..', 'assets', '1200px-CERN_logo.png'))
                .expect(201)
                .end((err, _res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    done();
                });
        });
    });

    describe('GET /api/attachments/:attachmentId', () => {
        it('should return 200', (done) => {
            request(server)
                .get('/api/attachments/1')
                .expect(200)
                .end((err, _res) => {
                    if (err) {
                        done(err);
                        return;
                    }
                    done();
                });
        });
    });
};
