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

const { expect } = require('chai');
const protoLoader = require('@grpc/proto-loader');
const { getLoaderOptions } = require('../../lib/server/GRPCServer.js');
const { extractAbsoluteMessageDefinitions } = require('../../lib/server/gRPC/services/protoParsing/extractAbsoluteMessageDefinitions.js');

const PROTO_DIR = `${__dirname}/proto`;

module.exports = () => {
    it('should successfully extract messages definitions map', () => {
        const proto = protoLoader.loadSync(
            `${PROTO_DIR}/main.proto`,
            getLoaderOptions(PROTO_DIR),
        );
        const absoluteMessagesDefinitions = extractAbsoluteMessageDefinitions(proto);

        expect([...absoluteMessagesDefinitions.keys()]).to.eql([
            'EnumsMessage',
            'EnumsMessage.D',
            'A',
            'B',
            'B.B1',
            'B.B1.B11',
            'C',
            'D',
            'BigIntMessage',
        ]);
        expect(absoluteMessagesDefinitions.get('B')?.field[0]?.name).to.equal('b1');
        expect(absoluteMessagesDefinitions.get('B.B1.B11')?.field[0]?.name).to.equal('b1');

        const b_b1_b11__b11 = absoluteMessagesDefinitions.get('B.B1.B11')?.field[1];
        expect(b_b1_b11__b11?.name).to.equal('b11');
        expect(b_b1_b11__b11?.type).to.equal('TYPE_ENUM');
        expect(b_b1_b11__b11?.typeName).to.equal('EnumB11');
    });
};
