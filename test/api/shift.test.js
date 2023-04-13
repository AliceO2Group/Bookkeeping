/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

const { resetDatabaseContent } = require('../utilities/resetDatabaseContent.js');
const request = require('supertest');
const { server } = require('../../lib/application');
const { expect } = require('chai');
const { logService } = require('../../lib/server/services/log/LogService.js');
const { shiftService } = require('../../lib/server/services/shift/ShiftService.js');

module.exports = () => {
    before(resetDatabaseContent);

    describe('GET /api/shift-data', () => {
        it.skip('should successfully return the data related to the current user\'s shift', async () => {
            shiftService.issuesLogEntriesTags = ['RUN'];

            // Create some logs for the shift

            const logIds = [];
            const defaultLogData = { title: 'Title', text: 'Text', subtype: 'comment', origin: 'process', userId: 2 };
            // Not kept : not the good tags and user
            await logService.create(defaultLogData, [], ['FOOD']);
            // Keep the 3 log ids
            logIds.push((await logService.create(defaultLogData, [], ['RUN'])).id);
            logIds.push((await logService.create({ ...defaultLogData, userId: 1 }, [], ['RUN'])).id);
            logIds.push((await logService.create({ ...defaultLogData, userId: 1 })).id);
            // Not kept : not the good tags and user
            await logService.create(defaultLogData);

            const response = await request(server).get('/api/shift-data?shiftType=ECS');

            expect(response.status).to.equal(200);
            expect(response.body.data).to.be.an('object');
            expect(response.body.data.issuesLogs).to.lengthOf(3);
            expect(response.body.data.issuesLogs.every(({ id }) => logIds.includes(id))).to.be.true;
        });
    });
};
