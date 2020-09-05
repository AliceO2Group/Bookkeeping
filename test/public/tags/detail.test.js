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
const puppeteer = require('puppeteer');
const pti = require('puppeteer-to-istanbul');
const { server } = require('../../../lib/application');

const { expect } = chai;

/**
 * Special method built due to Puppeteer limitations: looks for the first row matching an ID in a table
 * @param {Object} table An HTML element representing the entire tag table
 * @param {Object} page An object representing the browser page being used by Puppeteer
 * @return {String} The ID of the first matching row with data
 */
async function getFirstRow(table, page) {
    for (const child of table) {
        const id = await page.evaluate((element) => element.id, child);
        if (id.startsWith('row')) {
            return id;
        }
    }
}

module.exports = () => {
    let page;
    let browser;
    let url;

    let table;
    let firstRowId;

    before(async () => {
        browser = await puppeteer.launch({ args: ['--no-sandbox'] });
        page = await browser.newPage();
        await Promise.all([
            page.coverage.startJSCoverage({ resetOnNavigation: false }),
            page.coverage.startCSSCoverage(),
        ]);

        const { port } = server.address();
        url = `http://localhost:${port}`;
    });

    after(async () => {
        const [jsCoverage, cssCoverage] = await Promise.all([
            page.coverage.stopJSCoverage(),
            page.coverage.stopCSSCoverage(),
        ]);

        pti.write([...jsCoverage, ...cssCoverage].filter(({ url = '' } = {}) => url.match(/\.(js|css)$/)));
        await browser.close();
    });

    it('tag detail loads correctly', async () => {
        await page.goto(`${url}/?page=tag-detail&id=1`);
        await page.waitFor(100);

        const postExists = await page.$('h2');
        expect(Boolean(postExists)).to.be.true;

        const title = await page.evaluate((element) => element.innerText, postExists);
        expect(title).to.equal('Tag: FOOD');
    });

    it('can navigate to the log panel', async () => {
        await page.click('#logs-tab');
        await page.waitFor(100);
        const redirectedUrl = await page.url();
        expect(String(redirectedUrl).startsWith(`${url}/?page=tag-detail&id=1&panel=logs`)).to.be.true;
    });

    it('can navigate to the main panel', async () => {
        await page.click('#main-tab');
        await page.waitFor(100);
        const redirectedUrl = await page.url();
        expect(String(redirectedUrl).startsWith(`${url}/?page=tag-detail&id=1&panel=main`)).to.be.true;
    });

    it('can navigate to the log panel', async () => {
        await page.click('#logs-tab');
        await page.waitFor(100);
        const redirectedUrl = await page.url();
        expect(String(redirectedUrl).startsWith(`${url}/?page=tag-detail&id=1&panel=logs`)).to.be.true;
    });

    it('can navigate to a log detail page', async () => {
        table = await page.$$('tr');
        firstRowId = await getFirstRow(table, page);
        const parsedFirstRowId = parseInt(firstRowId.slice('row'.length, firstRowId.length), 10);

        // We expect the entry page to have the same id as the id from the tag overview
        await page.click(`#${firstRowId}`);
        await page.waitFor(100);
        const redirectedUrl = await page.url();
        expect(String(redirectedUrl).startsWith(`${url}/?page=log-detail&id=${parsedFirstRowId}`)).to.be.true;
    });

    it('notifies if a specified tag id is invalid', async () => {
        // Navigate to a tag detail view with an id that cannot exist
        await page.goto(`${url}/?page=tag-detail&id=abc`);
        await page.waitFor(100);

        // We expect there to be an error message
        const error = await page.$('.alert');
        expect(Boolean(error)).to.be.true;
        const message = await page.evaluate((element) => element.innerText, error);
        expect(message).to.equal('Invalid Attribute: "params.tagId" must be a number');
    });

    it('notifies if a specified tag id is not found', async () => {
        // Navigate to a tag detail view with an id that cannot exist
        await page.goto(`${url}/?page=tag-detail&id=999`);
        await page.waitFor(100);

        // We expect there to be an error message
        const error = await page.$('.alert');
        expect(Boolean(error)).to.be.true;
        const message = await page.evaluate((element) => element.innerText, error);
        expect(message).to.equal('Tag with this id (999) could not be found');
    });
};
