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
const { defaultBefore, defaultAfter, pressElement, goToPage, getFirstRow } = require('../defaults');

const { expect } = chai;

module.exports = () => {
    let page;
    let browser;
    let url;

    let table;
    let firstRowId;
    let parsedFirstRowId;

    before(async () => {
        [page, browser, url] = await defaultBefore(page, browser);
        await page.setViewport({
            width: 700,
            height: 720,
            deviceScaleFactor: 1,
        });
    });
    after(async () => {
        [page, browser] = await defaultAfter(page, browser);
    });

    it('loads the page successfully', async () => {
        const response = await page.goto(`${url}?page=tag-overview`, { waitUntil: 'networkidle0' });

        // We expect the page to return the correct status code, making sure the server is running properly
        expect(response.status()).to.equal(200);

        // We expect the page to return the correct title, making sure there isn't another server running on this port
        const title = await page.title();
        expect(title).to.equal('AliceO2 Bookkeeping');
    });

    it('should display name, last edited by, updated at, mattermost and email', async () => {
        const headers = await page.evaluate(() => {
            const ret = [];
            document.querySelectorAll('thead th').forEach((th) => ret.push(th.innerText));
            return ret;
        });
        expect(headers[0]).to.equal('Name');
        expect(headers[1]).to.equal('Last Edited by');
        expect(headers[2]).to.equal('Updated at');
        expect(headers[3]).to.equal('Mattermost');
        expect(headers[4]).to.equal('Email');
    });

    it('can navigate to a tag detail page', async () => {
        table = await page.$$('tr');
        firstRowId = await getFirstRow(table, page);
        parsedFirstRowId = parseInt(firstRowId.slice('row'.length, firstRowId.length), 10);

        // We expect the entry page to have the same id as the id from the tag overview
        await pressElement(page, `#${firstRowId}`);
        await page.waitForTimeout(100);
        const redirectedUrl = await page.url();
        expect(String(redirectedUrl).startsWith(`${url}/?page=tag-detail&id=${parsedFirstRowId}`)).to.be.true;
    });

    it('can navigate to the tag creation page', async () => {
        // Click on the button to start creating a new tag
        await goToPage(page, 'tag-create');

        // Expect the page to be the tag creation page at this point
        const redirectedUrl = await page.url();
        expect(redirectedUrl).to.equal(`${url}/?page=tag-create`);
    });

    it('can navigate to the tag overview page', async () => {
        // Click on the button to start creating a new tag
        await goToPage(page, 'tag-overview');

        // Expect the page to be the tag creation page at this point
        const redirectedUrl = await page.url();
        expect(redirectedUrl).to.equal(`${url}/?page=tag-overview`);
    });

    it('can filter tags by text', async () => {
        const inputSelector = 'thead th:first-of-type input';
        await page.waitForSelector(inputSelector);

        expect(await page.$eval(inputSelector, (input) => input.placeholder)).to.equal('Filter by name');

        await page.type(inputSelector, '-TAG-');
        await page.waitForTimeout(300);
        let table = await page.$$('tbody tr');
        expect(table.length).to.equal(42);

        await page.type(inputSelector, 'DO-NOT-EXIST');
        await page.waitForTimeout(300);
        table = await page.$$('tbody tr');
        expect(table.length).to.equal(1);
        expect(await page.$eval('table tbody tr', (row) => row.innerText)).to.equal('No data');
    });
};
