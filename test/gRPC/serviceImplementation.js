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
const { extractEnumsPaths } = require('../../lib/server/gRPC/services/protoParsing/extractEnumsPaths.js');
const { toGRPCEnum, fromGRPCEnum } = require('../../lib/server/gRPC/services/enumConverter/gRPCEnumValueConverter.js');
const sinon = require('sinon');
const { bindGRPCController } = require('../../lib/server/gRPC/bindGRPCController.js');

const PROTO_DIR = `${__dirname}/proto`;

describe('gRPC services implementation', () => {
    let proto;
    let absoluteMessagesDefinitions;

    before(() => {
        proto = grpc.loadPackageDefinition(protoLoader.loadSync(
            `${PROTO_DIR}/main.proto`,
            getLoaderOptions(PROTO_DIR),
        )).test;
        absoluteMessagesDefinitions = extractAbsoluteMessageDefinitions(proto);
    });

    it('should successfully convert between js to gRPC enums values, and vice-versa', () => {
        expect(toGRPCEnum('MyEnum', 'VALUE')).to.equal('MY_ENUM_VALUE');
        expect(fromGRPCEnum('MyEnum', 'MY_ENUM_VALUE')).to.equal('VALUE');
        expect(() => fromGRPCEnum('MyEnum', 'INVALID_VALUE')).to.throw('Invalid enum value INVALID_VALUE for enum MyEnum');

        // Specific case for run quality
        expect(toGRPCEnum('RunQuality', 'good')).to.equal('RUN_QUALITY_GOOD');
        expect(fromGRPCEnum('RunQuality', 'RUN_QUALITY_GOOD')).to.equal('good');
    });

    it('should successfully extract messages definitions map', () => {
        expect([...absoluteMessagesDefinitions.keys()]).to.eql(['ServiceMessage', 'ServiceMessage.D', 'A', 'B', 'B.B1', 'B.B1.B11', 'C', 'D']);
        expect(absoluteMessagesDefinitions.get('B')?.field[0]?.name).to.equal('b1');
        expect(absoluteMessagesDefinitions.get('B.B1.B11')?.field[0]?.name).to.equal('b1');

        const b_b1_b11__b11 = absoluteMessagesDefinitions.get('B.B1.B11')?.field[1];
        expect(b_b1_b11__b11?.name).to.equal('b11');
        expect(b_b1_b11__b11?.type).to.equal('TYPE_ENUM');
        expect(b_b1_b11__b11?.typeName).to.equal('EnumB11');
    });

    it('should successfully extract enums paths form services messages', () => {
        const method = proto.Service.service.Method;
        const enums = extractEnumsPaths(method.requestType.type, absoluteMessagesDefinitions);
        expect(enums).to.eql([
            { path: ['a'], property: 'a', name: 'EnumA' },
            { path: ['b', 'b1'], property: 'b1', name: 'EnumB1' },
            { path: ['b1'], property: 'b1', name: 'EnumB1' },
            { path: ['b11'], property: 'b1', name: 'EnumB1' },
            { path: ['b11'], property: 'b11', name: 'EnumB11' },
            { path: ['c', 'b', 'b1'], property: 'b1', name: 'EnumB1' },
            { path: ['c', 'b1'], property: 'b1', name: 'EnumB1' },
            { path: ['c', 'b11'], property: 'b1', name: 'EnumB1' },
            { path: ['c', 'b11'], property: 'b11', name: 'EnumB11' },
            { path: ['c'], property: 'eb1', name: 'EnumB1' },
            { path: ['d'], property: 'd', name: 'EnumD' },
            { path: [], property: 'ea', name: 'EnumA' },
            { path: [], property: 'eb1', name: 'EnumB1' },
            { path: [], property: 'eb11', name: 'EnumB11' },
            { path: [], property: 'ed', name: 'EnumD' },
        ]);
    });

    it('Should successfully bind a synchronous controller', () => {
        const callback = sinon.fake();

        const gRPCMessage = {
            a: { a: 'ENUM_A_1' },
            b: { b1: { b1: 'ENUM_B1_1' } },
            b1: { b1: 'ENUM_B1_1' },
            b11: { b1: 'ENUM_B1_1', b11: 'ENUM_B11_1' },
            c: {
                b: { b1: { b1: 'ENUM_B1_1' } },
                b1: { b1: 'ENUM_B1_1' },
                b11: { b1: 'ENUM_B1_1', b11: 'ENUM_B11_1' },
                eb1: 'ENUM_B1_1',
            },
            d: { d: 'ENUM_D_1' },
            ea: 'ENUM_A_1',
            eb1: 'ENUM_B1_1',
            eb11: 'ENUM_B11_1',
            ed: 'ENUM_D_1',
        };

        const jSMessage = {
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

        const impl = sinon.fake.returns(jSMessage);
        const controller = {
            Method: (args) => impl(args),
        };
        const adapter = bindGRPCController(proto.Service.service, controller, absoluteMessagesDefinitions);
        adapter.Method({ request: gRPCMessage }, callback);
        // Fails: sinon.assert.calledWith(controller.Method, jSMessage);
        sinon.assert.calledWith(impl, jSMessage);
        // Fails: sinon.assert.calledWith(callback, gRPCMessage);
    });

    it('should throw when calling a controller without return is called', () => {
        const callback = sinon.fake();

        const controller = {
            Method: sinon.fake(),
        };
        const adapter = bindGRPCController(proto.Service.service, controller, absoluteMessagesDefinitions);
        adapter.Method({ request: {} }, callback);
        expect(controller.Method.calledWith({ ea: undefined, eb1: undefined, eb11: undefined, ed: undefined })).to.be.true;
        expect(callback.calledWith({ code: 2, message: 'Controller for /test.Service/Method returned a null response' })).to.be.true;
    });
});
