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

const { extractFieldsConverters } = require('../../lib/server/gRPC/services/protoParsing/extractFieldsConverters.js');
const { expect } = require('chai');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const { getLoaderOptions } = require('../../lib/server/GRPCServer.js');
const { extractAbsoluteMessageDefinitions } = require('../../lib/server/gRPC/services/protoParsing/extractAbsoluteMessageDefinitions.js');

const PROTO_DIR = `${__dirname}/proto`;

module.exports = () => {
    let proto;
    let absoluteMessagesDefinitions;

    before(() => {
        proto = grpc.loadPackageDefinition(protoLoader.loadSync(
            `${PROTO_DIR}/main.proto`,
            getLoaderOptions(PROTO_DIR),
        )).test;
        absoluteMessagesDefinitions = extractAbsoluteMessageDefinitions(proto);
    });

    it('should successfully extract enums paths form services messages', () => {
        const service = proto.Service.service.TestEnums;

        const fieldsConverters = extractFieldsConverters(service.requestType.type, absoluteMessagesDefinitions);
        expect(fieldsConverters.map(({ path }) => path)).to.eql([
            ['a', 'a'],
            ['b', 'b1', 'b1'],
            ['b1', 'b1'],
            ['b11', 'b1'],
            ['b11', 'b11'],
            ['c', 'b', 'b1', 'b1'],
            ['c', 'b1', 'b1'],
            ['c', 'b11', 'b1'],
            ['c', 'b11', 'b11'],
            ['c', 'eb1'],
            ['d', 'd'],
            ['ea'],
            ['eb1'],
            ['eb11'],
            ['ed'],
        ]);
    });

    it('should successfully extract int64 and uint64 paths form services messages', () => {
        const service = proto.Service.service.TestBigInts;
        const fieldsConverters = extractFieldsConverters(service.requestType.type, absoluteMessagesDefinitions);
        expect(fieldsConverters.map(({ path }) => path)).to.eql([
            ['ui'],
            ['i'],
        ]);
    });
};
