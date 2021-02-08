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
const { defaultBefore, defaultAfter } = require('../defaults');

const { expect } = chai;

module.exports = () => {
    let page;
    let browser;
    let url;

    let parsedFirstRowId;

    before(async () => {
        [page, browser, url] = await defaultBefore(page, browser);
    });
    after(async () => {
        [page, browser] = await defaultAfter(page, browser);
    });

    it('loads the page successfully', async () => {
        const response = await page.goto(`${url}?page=home`, { waitUntil: 'networkidle0' });

        // We expect the page to return the correct status code, making sure the server is running properly
        expect(response.status()).to.equal(200);

        // We expect the page to return the correct title, making sure there isn't another server running on this port
        const title = await page.title();
        expect(title).to.equal('AliceO2 Bookkeeping 2020');
    });

    it('can navigate to a log detail page', async () => {
        const firstRow = await page.$('tr.clickable');
        const firstRowId = await firstRow.evaluate((row) => row.id);
        parsedFirstRowId = parseInt(firstRowId.slice('row'.length, firstRowId.length), 10);

        // We expect the entry page to have the same id as the id from the log overview
        await firstRow.evaluate((row) => row.click());
        await page.waitForTimeout(500);

        const redirectedUrl = await page.url();
        expect(redirectedUrl).to.equal(`${url}/?page=log-detail&id=${parsedFirstRowId}`);
    });
};
