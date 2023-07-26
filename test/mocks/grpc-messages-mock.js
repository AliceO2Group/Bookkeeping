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
const { Long } = require('@grpc/proto-loader');

exports.gRPCEnumsMessage = {
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

exports.jsEnumsMessage = {
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

exports.grpcBigintMessage = {
    ui: Long.fromString('FEDCBA9876543210', true, 16),
    i: Long.fromString('-76543210FEDCBA98', false, 16),
};

exports.jsBigintMessage = { ui: 0xFEDCBA9876543210n, i: -0x76543210FEDCBA98n };

const grpcTestTimestamp = 1690359740139;

exports.grpcTestTimestamp = grpcTestTimestamp;

exports.grpcDateMessage = {
    t: {
        seconds: Long.fromNumber(Math.floor(grpcTestTimestamp / 1e3), false),
        nanos: grpcTestTimestamp % 1e3 * 1e6,
    },
};
exports.jsDateMessage = { t: new Date(grpcTestTimestamp) };
