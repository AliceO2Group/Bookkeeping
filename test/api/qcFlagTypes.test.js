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

    describe('GET /api/qcFlagTypes/:id', () => {
        it('should successfuly fetch one QC flag type', (done) => {
            request(server)
                .get('/api/qcFlagTypes/13')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data: flagType } = res.body;
                    delete flagType.createdAt;
                    delete flagType.updatedAt;
                    expect(flagType).to.be.eql({
                        id: 13,
                        name: 'Bad',
                        method: 'Bad',
                        bad: true,
                        color: null,

                        archived: false,
                        archivedAt: null,

                        createdById: 1,
                        createdBy: { id: 1, externalId: 1, name: 'John Doe' },
                        lastUpdatedById: null,
                        lastUpdatedBy: null,
                    });
                    done();
                });
        });

        it('should send error that QC flag type with given id cannot be found', (done) => {
            request(server)
                .get('/api/qcFlagTypes/99999')
                .expect(404)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { errors } = res.body;
                    expect(errors).to.be.eql([
                        {
                            status: 404,
                            title: 'Not found',
                            detail: 'Quality Control Flag Type with this id (99999) could not be found',
                        },
                    ]);

                    done();
                });
        });
    });
};
