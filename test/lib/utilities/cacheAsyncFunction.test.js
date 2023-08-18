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

const { expect } = chai;
const assert = require('assert');
const { cacheAsyncFunction } = require('../../../lib/utilities/cacheAsyncFunction.js');
const { func } = require('joi');

module.exports = () => {
    it('should successfully cache a resolving function', async () => {
        const fake = sinon.fake();
        // eslint-disable-next-line require-jsdoc
        const functionMock = async (value) => {
            fake(value);
            return value;
        };

        const cachedFunctionMock = cacheAsyncFunction(functionMock);

        expect(cachedFunctionMock(0) instanceof Promise).to.be.true;
        expect(await cachedFunctionMock(0)).to.equal(0);
        expect(await cachedFunctionMock(0)).to.equal(0);

        expect(fake.callCount).to.equal(1);

        expect(await cachedFunctionMock(1)).to.equal(1);
        expect(await cachedFunctionMock(1)).to.equal(1);

        expect(fake.callCount).to.equal(2);
    });

    it('should successfully cache a rejecting function', async () => {
        const fake = sinon.fake();
        // eslint-disable-next-line require-jsdoc
        const rejecting = async (value) => {
            fake();
            throw new Error(value);
        };
        const cachedRejecting = cacheAsyncFunction(rejecting);

        await assert.rejects(
            () => cachedRejecting(0),
            new Error(0),
        );
        await assert.rejects(
            () => cachedRejecting(0),
            new Error(0),
        );

        expect(fake.callCount).to.equal(1);

        await assert.rejects(
            () => cachedRejecting(1),
            new Error(1),
        );
        await assert.rejects(
            () => cachedRejecting(1),
            new Error(1),
        );

        expect(fake.callCount).to.equal(2);
    });

    it('should successfully delete function call when cache overflows', async () => {
        const fake = sinon.fake();
        // eslint-disable-next-line require-jsdoc
        const functionMock = async (value) => {
            fake(value);
            return value;
        };
        const firstCache = cacheAsyncFunction(functionMock, {cacheSize: 2});
        const secondCache = cacheAsyncFunction(functionMock, {cacheSize: 1});

        expect(await firstCache(0)).to.equal(0);
        expect(await firstCache(0)).to.equal(0);

        expect(fake.callCount).to.equal(1);

        expect(await firstCache(1)).to.equal(1);
        expect(await firstCache(1)).to.equal(1);

        expect(fake.callCount).to.equal(2);

        expect(await firstCache(0)).to.equal(0);
        expect(await firstCache(0)).to.equal(0);

        expect(fake.callCount).to.equal(2);

        expect(await firstCache(2)).to.equal(2);
        expect(await firstCache(2)).to.equal(2);

        expect(fake.callCount).to.equal(3);

        expect(await firstCache(0)).to.equal(0);
        expect(await firstCache(0)).to.equal(0);

        expect(fake.callCount).to.equal(4);

        fake.resetHistory();

        expect(await secondCache(0)).to.equal(0);
        expect(await secondCache(0)).to.equal(0);

        expect(fake.callCount).to.equal(1);

        expect(await secondCache(1)).to.equal(1);
        expect(await secondCache(1)).to.equal(1);

        expect(fake.callCount).to.equal(2);

        expect(await secondCache(0)).to.equal(0);
        expect(await secondCache(0)).to.equal(0);

        expect(fake.callCount).to.equal(3);

        expect(await secondCache(1)).to.equal(1);
        expect(await secondCache(1)).to.equal(1);

        expect(fake.callCount).to.equal(4);
    });
};
