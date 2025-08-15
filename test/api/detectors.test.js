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

    describe('GET /api/detectors', () => {
        it('should return 200 with the list of detectors', async () => {
            const response = await request(server).get('/api/detectors');

            expect(response.status).to.equal(200);
            expect(response.body).to.be.an('object');
            expect(response.body.data.map(({ id, name }) => ({ id, name }))).to.deep.eq([
                { id: 17, name: 'ACO' },
                { id: 1, name: 'CPV' },
                { id: 18, name: 'CTP' },
                { id: 2, name: 'EMC' },
                { id: 23, name: 'EVS' },
                { id: 3, name: 'FDD' },
                { id: 19, name: 'FIT' },
                { id: 7, name: 'FT0' },
                { id: 5, name: 'FV0' },
                { id: 21, name: 'GLO' },
                { id: 6, name: 'HMP' },
                { id: 4, name: 'ITS' },
                { id: 8, name: 'MCH' },
                { id: 9, name: 'MFT' },
                { id: 10, name: 'MID' },
                { id: 24, name: 'MUD' },
                { id: 11, name: 'PHS' },
                { id: 20, name: 'QC-SPECIFIC' },
                { id: 12, name: 'TOF' },
                { id: 13, name: 'TPC' },
                { id: 14, name: 'TRD' },
                { id: 15, name: 'TST' },
                { id: 22, name: 'VTX' },
                { id: 16, name: 'ZDC' },
            ]);
        });
    });
};
