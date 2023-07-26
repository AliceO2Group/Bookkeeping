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
        proto = protoLoader.loadSync(
            `${PROTO_DIR}/main.proto`,
            getLoaderOptions(PROTO_DIR),
        );
        absoluteMessagesDefinitions = extractAbsoluteMessageDefinitions(proto);
    });

    it('should successfully extract enums paths form services messages', () => {
        const service = proto['test.Service'].TestEnums;

        const fieldsConverters = extractFieldsConverters('test', service.requestType.type, absoluteMessagesDefinitions);
        expect(fieldsConverters.map(({ path, name }) => ({ path, name }))).to.eql([
            { path: ['a'], name: 'a' },
            { path: ['b', 'b1'], name: 'b1' },
            { path: ['b1'], name: 'b1' },
            { path: ['b11'], name: 'b1' },
            { path: ['b11'], name: 'b11' },
            { path: ['c', 'b', 'b1'], name: 'b1' },
            { path: ['c', 'b1'], name: 'b1' },
            { path: ['c', 'b11'], name: 'b1' },
            { path: ['c', 'b11'], name: 'b11' },
            { path: ['c'], name: 'eb1' },
            { path: ['d'], name: 'd' },
            { path: [], name: 'ea' },
            { path: [], name: 'eb1' },
            { path: [], name: 'eb11' },
            { path: [], name: 'ed' },
        ]);
    });

    it('should successfully extract int64 and uint64 paths form services messages', () => {
        const service = proto['test.Service'].TestBigInts;
        const fieldsConverters = extractFieldsConverters('test', service.requestType.type, absoluteMessagesDefinitions);
        expect(fieldsConverters.map(({ path, name }) => ({ path, name }))).to.eql([
            { path: [], name: 'ui' },
            { path: [], name: 'i' },
        ]);
    });

    it('should successfully extract dates paths form services messages', () => {
        const service = proto['test.Service'].TestDates;
        const fieldsConverters = extractFieldsConverters('test', service.requestType.type, absoluteMessagesDefinitions);
        expect(fieldsConverters.map(({ path, name }) => ({ path, name }))).to.eql([
            { path: [], name: 't' },
        ]);
    });
};
