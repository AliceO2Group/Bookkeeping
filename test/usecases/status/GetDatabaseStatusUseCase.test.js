/* eslint-disable no-trailing-spaces */
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

const { status: { GetDatabaseStatusUseCase } } = require('../../../lib/usecases');
const chai = require('chai');
const sinon = require('sinon');
const database = require('../../../lib/database');
const {
    DatabaseConfig: {
        host,
        port,
    } } = require('../../../lib/config');

const { expect } = chai;

module.exports = () => {
    it('should give current database data', async () => {
        const data = await new GetDatabaseStatusUseCase()
            .execute();
        expect(data.status.ok).to.equal(true);
        expect(data.host).to.equal(host);
        expect(data.port).to.equal(port);
    });
    it('should return the error message when the user cannot connect', async () =>{
        const stub = sinon.stub(database, 'ping').returns(false);
        const data = await new GetDatabaseStatusUseCase()
            .execute();

        // Validate stub is called and extra data
        expect(stub.called);
        expect(data.status.ok).to.equal(false);
        stub.resetBehavior();
    });
};
