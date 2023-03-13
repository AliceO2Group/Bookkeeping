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

const sinon = require('sinon');
const chai = require('chai');
const { rbacMiddleware } = require('../../../../lib/server/middleware/rbac.middleware.js');

const { expect } = chai;

const request = {
    session: {
        access: ['role1', 'role2'],
    },
};

const expectRequestToReturn403 = (request) => {
    const response = {};
    response.status = sinon.fake.returns(response);
    response.json = sinon.fake.returns(response);

    rbacMiddleware(['role1', 'role2'])({}, response, null);
    expect(response.status.calledWith(403)).to.be.true;
    expect(response.json.firstArg).to.eql({ errors: [{ status: '403', title: 'Access denied' }] });
};

module.exports = () => {
    it('Should successfully call next if the request\'s principal has one of the specified roles', async () => {
        {
            const next = sinon.fake();

            rbacMiddleware(['role1', 'role3'])(request, null, next);
            expect(next.calledOnce).to.be.true;
        }
        {
            const next = sinon.fake();

            rbacMiddleware(['role1', 'role2'])(request, null, next);
            expect(next.calledOnce).to.be.true;
        }
        {
            const next = sinon.fake();

            rbacMiddleware(['role0', 'role1', 'role3'])(request, null, next);
            expect(next.calledOnce).to.be.true;
        }
    });
    it('Should successfully configure response to be a 403 if the request is not authenticated', async () => {
        expectRequestToReturn403({});
        expectRequestToReturn403({ session: {} });
        expectRequestToReturn403({ session: { access: null } });
    });
    it('Should successfully configure response to be a 403 if the request\'s principal do not have any of the specified roles', async () => {
        expectRequestToReturn403({ session: { access: ['role0'] } });
    });
};
