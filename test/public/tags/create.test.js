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

module.exports = () => {
    let page;
    let browser;
    let url;

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

    it('can create a tag', async () => {
        const text = 'EXAMPLE';
        await page.goto(`${url}/?page=tag-create`, { waitUntil: 'networkidle0' });

        // Enter the text value
        await page.waitForSelector('#text');
        await page.type('#text', text);

        // Create the new tag
        await page.click('button#send');

        // Verify the title of the page
        await page.waitForSelector('.mv2');
        const tagTitle = await page.$eval('.mv2', (element) => element.innerText);
        expect(tagTitle).to.equal(`Tag: ${text}`);

        // Return the page to the tag overview
        await page.goto(`${url}/?page=tag-overview`, { waitUntil: 'networkidle0' });

        // Get the last post and verify the title of the log we posted
        const table = await page.$$('.table > tbody > tr');
        const lastRow = await table[table.length - 1];
        const lastRowId = await page.evaluate((element) => element.id, lastRow);
        const lastRowInnerText = await page.$eval(`#${lastRowId}-text`, (element) => element.innerText);
        expect(lastRowInnerText).to.equal(text);
    });

    it('shows an error message if tag creation failed', async () => {
        const text = 'EXAMPLE';

        // Go to the tag creation page
        await page.click('button#create');

        // Enter the duplicate text value
        await page.waitForSelector('#text');
        await page.type('#text', text);

        // Create the new tag
        await page.click('button#send');

        // Because this tag already exists, we expect an error message to appear
        await page.waitForSelector('.alert');
        const errorMessage = await page.$eval('.alert', (element) => element.innerText);
        expect(errorMessage).to.equal('Conflict: The provided entity already exists');
    });
};
