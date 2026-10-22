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
const { DetectorType } = require('../../lib/domain/enums/DetectorTypes');
const { BkpRoles } = require('../../lib/domain/enums/BkpRoles');

module.exports = () => {
    before(resetDatabaseContent);

    describe('POST /api/gaqDetectors', () => {
        it('should successfully set GAQ detectors', async () => {
            const dataPassId = 3;
            const runNumbers = [49, 56];
            const detectorIds = [4, 7];
            const response = await request(server).post(`/api/gaqDetectors?token=${BkpRoles.GAQ}`).send({
                dataPassId,
                runNumbers,
                detectorIds,
            });
            expect(response.status).to.be.equal(201);
            expect(response.body.data).to.have.all.deep.members(runNumbers
                .flatMap((runNumber) => detectorIds.map((detectorId) => ({ dataPassId, runNumber, detectorId }))));
        });

        it('should fail to set GAQ detectors because of insufficient permission', async () => {
            const dataPassId = 3;
            const runNumbers = [49, 56];
            const detectorIds = [4, 7];
            const response = await request(server).post(`/api/gaqDetectors?token=${BkpRoles.GUEST}`).send({
                dataPassId,
                runNumbers,
                detectorIds,
            });
            expect(response.status).to.be.equal(403);

            const { errors } = response.body;
            expect(errors.find(({ title }) => title === 'Access denied')).to.not.be.null;
        });
    });

    describe('GET /api/gaqDetectors', () => {
        it('should return 200 with the list of GAQ detectors', async () => {
            const response = await request(server).get('/api/gaqDetectors?dataPassId=3&runNumber=56');

            expect(response.status).to.equal(200);
            const { data } = response.body;
            expect(data).to.be.an('array');
            expect(data).to.have.all.deep.members([
                { id: 7, name: 'FT0', type: DetectorType.PHYSICAL },
                { id: 4, name: 'ITS', type: DetectorType.PHYSICAL },
            ]);
        });
    });
};
