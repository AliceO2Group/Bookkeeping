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

const protoLoader = require('@grpc/proto-loader');
const { getLoaderOptions } = require('../../lib/server/GRPCServer.js');
const { extractAbsoluteMessageDefinitions } = require('../../lib/server/gRPC/services/protoParsing/extractAbsoluteMessageDefinitions.js');
const sinon = require('sinon');
const { bindGRPCController } = require('../../lib/server/gRPC/bindGRPCController.js');
const { jsEnumsMessage, jsBigintMessage, grpcTestTimestamp, gRPCEnumsMessage, grpcBigintMessage, grpcDateMessage, jsDateMessage }
    = require('../mocks/grpc-messages-mock.js');

const PROTO_DIR = `${__dirname}/proto`;

module.exports = () => {
    const proto = protoLoader.loadSync(
        `${PROTO_DIR}/main.proto`,
        getLoaderOptions(PROTO_DIR),
    );
    const absoluteMessagesDefinitions = extractAbsoluteMessageDefinitions(proto);

    it('Should successfully bind a synchronous controller', async () => {
        const testEnumsImpl = sinon.fake.returns(JSON.parse(JSON.stringify(jsEnumsMessage)));
        const testBigIntsImpl = sinon.fake.returns({ ...jsBigintMessage });
        const testDatesImpl = sinon.fake.returns({ t: new Date(grpcTestTimestamp) });

        const callback = sinon.fake();

        const controller = {
            TestEnums: (...args) => testEnumsImpl(...args),
            TestBigInts: (...args) => testBigIntsImpl(...args),
            TestDates: (...args) => testDatesImpl(...args),
        };
        const adapter = bindGRPCController('test', proto['test.Service'], controller, absoluteMessagesDefinitions);

        await adapter.TestEnums({ request: JSON.parse(JSON.stringify(gRPCEnumsMessage)) }, callback);
        expect(testEnumsImpl.calledWithMatch(jsEnumsMessage)).to.be.true;
        expect(callback.calledWithMatch(null, gRPCEnumsMessage)).to.be.true;

        callback.resetHistory();

        await adapter.TestBigInts({ request: { ...grpcBigintMessage } }, callback);
        expect(testBigIntsImpl.calledWithMatch(jsBigintMessage)).to.be.true;
        expect(callback.calledWithMatch(null, grpcBigintMessage)).to.be.true;

        callback.resetHistory();

        await adapter.TestDates({ request: { t: { ...grpcDateMessage.t } } }, callback);
        expect(testDatesImpl.calledWithMatch(jsDateMessage)).to.be.true;
        expect(callback.calledWithMatch(null, grpcDateMessage)).to.be.true;
    });

    it('should throw when calling a controller without return is called', async () => {
        const testEnumsImpl = sinon.fake();
        const controller = {
            TestEnums: (...args) => testEnumsImpl(...args),
            TestBigInts: sinon.fake(),
            TestDates: sinon.fake(),
        };
        const callback = sinon.fake();

        const adapter = bindGRPCController('test', proto['test.Service'], controller, absoluteMessagesDefinitions);

        await adapter.TestEnums({ request: {} }, callback);

        expect(testEnumsImpl.calledWith({
            ea: undefined,
            eb1: undefined,
            eb11: undefined,
            ed: undefined,
        })).to.be.true;

        expect(callback.calledWith({
            code: 2,
            message: 'Controller for /test.Service/TestEnums returned a null response',
        })).to.be.true;
    });
};
