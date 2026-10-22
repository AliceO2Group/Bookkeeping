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

const { statusService } = require('../../../../../lib/server/services/status/StatusService.js');
const { expect } = require('chai');
const sinon = require('sinon');
const database = require('../../../../../lib/database/index.js');
const { DatabaseConfig: { host, port } } = require('../../../../../lib/config/index.js');

module.exports = () => {
    it('should give current gui data', () => {
        const data = statusService.getGuiStatus({ host: 'test', port: 4000 });

        expect(data.status.ok).to.equal(true);
        expect(data.status.configured).to.equal(true);
        expect(data.host).to.equal('test');
        expect(data.port).to.equal(4000);
        expect(data.version).to.be.a('string');
    });

    it('should give current database data', async () => {
        const data = await statusService.getDatabaseStatus();

        expect(data.status.ok).to.equal(true);
        expect(data.host).to.equal(host);
        expect(data.port).to.equal(port);
    });

    it('should return the database as not ok when it cannot be reached', async () => {
        const stub = sinon.stub(database, 'ping').returns(false);
        try {
            const data = await statusService.getDatabaseStatus();

            expect(stub.called).to.be.true;
            expect(data.status.ok).to.equal(false);
        } finally {
            stub.restore();
        }
    });
};
