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

const sinon = require('sinon');
const { expect } = require('chai');
const application = require('../../lib/application');

module.exports = () => {
    describe('Application start-up', () => {
        let connectDatabaseStub;
        let runStub;
        let resolveMigration;

        beforeEach(() => {
            runStub = sinon.stub(application, 'run').resolves();
            connectDatabaseStub = sinon.stub(application, 'connectDatabase');
        });

        afterEach(() => {
            sinon.restore();
        });

        it('should not start anything (servers, synchronizers...) while migrations are still running', async () => {
            connectDatabaseStub.returns(new Promise((resolve) => {
                resolveMigration = resolve;
            }));

            const startPromise = application.start();

            // Let any (wrongly) scheduled work run
            await new Promise((resolve) => setImmediate(resolve));
            expect(runStub.called).to.be.false;

            resolveMigration(true);
            expect(await startPromise).to.be.true;
            expect(runStub.calledOnce).to.be.true;
            expect(runStub.calledAfter(connectDatabaseStub)).to.be.true;
        });

        it('should never start the application if the database could not be prepared', async () => {
            connectDatabaseStub.resolves(false);

            expect(await application.start()).to.be.false;
            expect(runStub.called).to.be.false;
        });
    });
};
