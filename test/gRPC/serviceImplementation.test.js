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

    describe('Controller request/response parsing', () => {
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

        // Bigint can not be parsed by JSON utils so it can't be easily copied
        // eslint-disable-next-line require-jsdoc
        const getGRPCBigintMessage = () => ({
            ui: Long.fromString('FEDCBA9876543210', true, 16),
            i: Long.fromString('-76543210FEDCBA98', false, 16),
        });

        const gRPCRepeatedMessage = {
            enum: ['AN_ENUM_0', 'AN_ENUM_1', 'AN_ENUM_0'],
            nested: [{ enum: ['AN_ENUM_0', 'AN_ENUM_1'] }, { enum: ['AN_ENUM_1', 'AN_ENUM_0'] }],
        };

        const jsRepeatedMessage = {
            enum: ['0', '1', '0'],
            nested: [{ enum: ['0', '1'] }, { enum: ['1', '0'] }],
        };

        const testEnumsImpl = sinon.fake.returns(jsEnumsMessage);
        const testBigIntsImpl = sinon.fake.returns({ ui: 0xFEDCBA9876543210n, i: -0x76543210FEDCBA98n });
        const testRepeatedImpl = sinon.fake.returns(jsRepeatedMessage);

        const controller = {
            TestEnums: (...args) => testEnumsImpl(...args),
            TestBigInts: (...args) => testBigIntsImpl(...args),
            TestRepeated: (...args) => testRepeatedImpl(...args),
        };
        const adapter = bindGRPCController(proto.Service.service, controller, absoluteMessagesDefinitions);

        afterEach(() => {
            sinon.restore();
        });

        it('Should successfully parse bigints', async () => {
            const callback = sinon.fake();

            await adapter.TestBigInts({ request: getGRPCBigintMessage() }, callback);
            sinon.assert.calledWithMatch(testBigIntsImpl, { ui: 0xFEDCBA9876543210n, i: -0x76543210FEDCBA98n });
            sinon.assert.calledWithMatch(callback, null, getGRPCBigintMessage());
        });

        it('Should successfully parse enums', async () => {
            const callback = sinon.fake();

            // Copy jsEnumsMessage because it might be modified in place by the controller binding
            const expectedJsEnumsArgument = JSON.parse(JSON.stringify(jsEnumsMessage));

            await adapter.TestEnums({ request: JSON.parse(JSON.stringify(gRPCEnumsMessage)) }, callback);
            sinon.assert.calledWithMatch(testEnumsImpl, expectedJsEnumsArgument);
            sinon.assert.calledWithMatch(callback, null, gRPCEnumsMessage);
        });

        it('Should successfully parse repeated fields', async () => {
            const callback = sinon.fake();

            // Copy jsRepeatedMessage because it might be modified in place by the controller binding
            const expectedJsRepeatedArgument = JSON.parse(JSON.stringify(jsRepeatedMessage));

            await adapter.TestRepeated({ request: JSON.parse(JSON.stringify(gRPCRepeatedMessage)) }, callback);
            sinon.assert.calledWithMatch(testRepeatedImpl, expectedJsRepeatedArgument);
            sinon.assert.calledWithMatch(callback, null, gRPCRepeatedMessage);
        });
    });

    it('should throw when calling a controller without return is called', async () => {
        const testEnumsImpl = sinon.fake();
        const controller = {
            TestEnums: (...args) => testEnumsImpl(...args),
            TestBigInts: sinon.fake(),
            TestRepeated: sinon.fake(),
        };
        const callback = sinon.fake();

        const adapter = bindGRPCController(proto.Service.service, controller, absoluteMessagesDefinitions);

        await adapter.TestEnums({ request: {} }, callback);

        sinon.assert.calledWithMatch(testEnumsImpl, {});

        expect(callback.calledWithMatch({
            code: 2,
            message: 'Controller for /test.Service/TestEnums returned a null response',
        })).to.be.true;
    });
};
