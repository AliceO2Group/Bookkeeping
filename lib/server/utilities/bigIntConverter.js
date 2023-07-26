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

/**
 * Convert a js BigInt to Long
 *
 * @param {BigInt} bigint the BigInt to convert
 * @param {boolean} unsigned true if the bigint to convert is unsigned
 * @return {Long} the resulting long
 */
exports.bigIntToLong = (bigint, unsigned) => Long.fromString(bigint.toString(8), unsigned, 8);

/**
 * Convert a Long to a js BigInt
 *
 * @param {Long} long the long to convert
 * @return {BigInt} the resulting BigInt
 */
exports.longToBigInt = (long) => BigInt(long.toString(10));
