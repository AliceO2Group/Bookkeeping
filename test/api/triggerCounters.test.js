const { resetDatabaseContent } = require('../utilities/resetDatabaseContent');
const request = require('supertest');
const { server } = require('../../lib/application');
const { expect } = require('chai');

module.exports = () => {
    before(resetDatabaseContent);

    describe('GET /api/trigger-counters', () => {
        it('Should successfully return the list of trigger counters for a given run', async () => {
            {
                const response = await request(server).get('/api/trigger-counters/1');

                expect(response.status).to.equal(200);
                expect(response.body.data.map(({ id, runNumber, className }) => ({ id, runNumber, className }))).to.deep.eql([
                    { id: 1, runNumber: 1, className: 'FIRST-CLASS-NAME' },
                    { id: 2, runNumber: 1, className: 'SECOND-CLASS-NAME' },
                ]);
            }
            {
                const response = await request(server).get('/api/trigger-counters/2');

                expect(response.status).to.equal(200);
                expect(response.body.data.map(({ id }) => id)).to.eql([]);
            }
        });
    });
};
