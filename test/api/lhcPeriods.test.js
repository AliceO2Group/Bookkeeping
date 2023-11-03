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

    describe('GET /api/lhcPeriods', () => {
        it('should successfuly fetch all data', (done) => {
            request(server)
                .get('/api/lhcPeriods')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data } = res.body;
                    expect(data).to.be.an('array');
                    expect(data).to.be.lengthOf(2);

                    done();
                });
        });
        it('should successfuly filter on ids', (done) => {
            request(server)
                .get('/api/lhcPeriods?filter[ids]=1')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data } = res.body;
                    expect(data).to.be.an('array');
                    expect(data).to.be.lengthOf(1);
                    expect(data[0].name).to.be.equal('LHC22a');

                    done();
                });
        });
        it('should successfuly filter on names', (done) => {
            request(server)
                .get('/api/lhcPeriods?filter[names]=LHC22b')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data } = res.body;
                    expect(data).to.be.an('array');
                    expect(data).to.be.lengthOf(1);
                    expect(data[0].id).to.be.equal(2);

                    done();
                });
        });
        it('should successfuly sort on id and name', (done) => {
            request(server)
                .get('/api/lhcPeriods?sort[id]=DESC&sort[name]=ASC')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data } = res.body;
                    expect(data).to.be.an('array');
                    expect(data).to.be.lengthOf(2);
                    expect(data[0].name).to.be.equal('LHC22b');
                    expect(data[1].name).to.be.equal('LHC22a');

                    done();
                });
        });
        it('should support pagination', (done) => {
            request(server)
                .get('/api/lhcPeriods?page[offset]=1&sort[id]=desc')
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        done(err);
                        return;
                    }

                    const { data } = res.body;
                    expect(data).to.be.an('array');
                    expect(data).to.be.lengthOf(1);
                    expect(data[0].name).to.be.equal('LHC22a');

                    done();
                });
        });
    });
};
