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

const chai = require('chai');
const { awaitIfNeeded } = require('../../lib/utilities/awaitIfNeeded.js');

const { expect } = chai;

module.exports = () => {
    it('should successfully handle a non-promise argument', async () => {
        expect(await awaitIfNeeded(true)).to.be.true;
        const myObject = { a: 102 };
        expect(await awaitIfNeeded(myObject)).to.equal(myObject);
    });

    it('should successfully handle a promise argument', async () => {
        let timeout;
        const firstPromise = new Promise((res) => {
            timeout = setInterval(() => res(), 10000);
        });
        clearTimeout(timeout);
        expect(await awaitIfNeeded(firstPromise)).to.equal(firstPromise);

        expect(await awaitIfNeeded(true)).to.be.true;

        const myObject = { a: 102 };
        expect(await awaitIfNeeded(Promise.resolve(myObject))).to.equal(myObject);
    });
};
