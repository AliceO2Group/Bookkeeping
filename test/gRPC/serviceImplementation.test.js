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

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { getLoaderOptions } = require('../../lib/server/GRPCServer.js');
const { extractAbsoluteMessageDefinitions } = require('../../lib/server/gRPC/services/protoParsing/extractAbsoluteMessageDefinitions.js');
const sinon = require('sinon');
const { bindGRPCController } = require('../../lib/server/gRPC/bindGRPCController.js');
const { Long } = require('@grpc/proto-loader');

const PROTO_DIR = `${__dirname}/proto`;

module.exports = () => {
    const proto = grpc.loadPackageDefinition(protoLoader.loadSync(
        `${PROTO_DIR}/main.proto`,
        getLoaderOptions(PROTO_DIR),
    )).test;
    const absoluteMessagesDefinitions = extractAbsoluteMessageDefinitions(proto);

    it('Should successfully bind a synchronous controller', async () => {
        const gRPCEnumsMessage = {
            a: {
                a: 'ENUM_A_1',
            },
            b: { b1: { b1: 'ENUM_B1_1' } },
            b1: { b1: 'ENUM_B1_1' },
            b11: { b1: 'ENUM_B1_1', b11: 'ENUM_B11_1' },
            c: {
                b: { b1: { b1: 'ENUM_B1_1' } },
                b1: { b1: 'ENUM_B1_1' },
                b11: { b1: 'ENUM_B1_1', b11: 'ENUM_B11_1' },
                eb1: 'ENUM_B1_1',
            },
            d: {
                d: 'ENUM_D_1',
            },
            ea: 'ENUM_A_1',
            eb1: 'ENUM_B1_1',
            eb11: 'ENUM_B11_1',
            ed: 'ENUM_D_1',
        };

        const jsEnumsMessage = {
            a: { a: '1' },
            b: { b1: { b1: '1' } },
            b1: { b1: '1' },
            b11: { b1: '1', b11: '1' },
            c: {
                b: { b1: { b1: '1' } },
                b1: { b1: '1' },
                b11: { b1: '1', b11: '1' },
                eb1: '1',
            },
            d: { d: '1' },
            ea: '1',
            eb1: '1',
            eb11: '1',
            ed: '1',
        };

        const testEnumsImpl = sinon.fake.returns(jsEnumsMessage);
        const testBigIntsImpl = sinon.fake.returns({ ui: 0xFEDCBA9876543210n, i: -0x76543210FEDCBA98n });
        const callback = sinon.fake();

        const controller = {
            TestEnums: (...args) => testEnumsImpl(...args),
            TestBigInts: (...args) => testBigIntsImpl(...args),
        };
        const adapter = bindGRPCController(proto.Service.service, controller, absoluteMessagesDefinitions);

        const expectedJsEnumsArgument = JSON.parse(JSON.stringify(jsEnumsMessage));

        await adapter.TestEnums({ request: gRPCEnumsMessage }, callback);
        testEnumsImpl.calledWith(expectedJsEnumsArgument);
        callback.calledWithMatch(null, gRPCEnumsMessage);

        callback.resetHistory();

        await adapter.TestBigInts({
            request: {
                ui: Long.fromString('FEDCBA9876543210', true, 16),
                i: Long.fromString('-76543210FEDCBA98', false, 16),
            },
        }, callback);
        testBigIntsImpl.calledWithMatch({ ui: 0xFEDCBA9876543210n, i: -0x76543210FEDCBA98n });
        callback.calledWithMatch(null, gRPCEnumsMessage);
    });

    it('should throw when calling a controller without return is called', async () => {
        const testEnumsImpl = sinon.fake();
        const controller = {
            TestEnums: (...args) => testEnumsImpl(...args),
            TestBigInts: sinon.fake(),
        };
        const callback = sinon.fake();

        const adapter = bindGRPCController(proto.Service.service, controller, absoluteMessagesDefinitions);

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
