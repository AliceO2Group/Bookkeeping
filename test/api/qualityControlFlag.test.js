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

    describe('GET /api/qualityControlFlags/types', () => {
        it('should successfuly fetch all qc flag types', (done) => {
            request(server)
                .get('/api/qualityControlFlags/types')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data } = res.body;
                    expect(data).to.be.an('array');
                    expect(data).to.be.lengthOf(5);
                    expect(data).to.have.deep.all.members([
                        {
                            id: 2,
                            name: 'UnknownQuality',
                            method: 'Unknown Quality',
                            bad: true,
                            archvied: false,
                            archviedAt: null,
                        },
                        {
                            id: 3,
                            name: 'CertifiedByExpert',
                            method: 'Certified by Expert',
                            bad: false,
                            archvied: false,
                            archviedAt: null,
                        },
                        {
                            id: 11,
                            name: 'LimitedAcceptance',
                            method: 'Limited acceptance',
                            bad: true,
                            archvied: false,
                            archviedAt: null,
                        },
                        {
                            id: 12,
                            name: 'BadPID',
                            method: 'Bad PID',
                            bad: true,
                            archvied: false,
                            archviedAt: null,
                        },
                        {
                            id: 13,
                            name: 'Bad',
                            method: 'Bad',
                            bad: true,
                            archvied: false,
                            archviedAt: null,
                        },
                    ]);
                    done();
                });
        });
    });
};
