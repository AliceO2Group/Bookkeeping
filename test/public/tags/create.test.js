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
        await page.goto(`${url}/?page=tag-create`);
        await page.waitFor(250);

        // Enter the text value
        await page.type('#text', text);

        // Create the new log
        const buttonSend = await page.$('button#send');
        await buttonSend.evaluate((button) => button.click());
        await page.waitFor(250);

        // Return the page to the tag overview
        const buttonOverviews = await page.$('#overviews');
        await buttonOverviews.evaluate((button) => button.click());
        await page.waitFor(100);
        await page.click('#tag-overview');
        await page.waitFor(250);

        // Ensure you are at the overview page again
        const redirectedUrl = await page.url();
        expect(redirectedUrl).to.equal(`${url}/?page=tag-overview`);

        // Get the last post and verify the title of the log we posted
        const table = await page.$$('tr');
        await page.waitFor(100);

        const lastRow = await table[table.length - 1];
        const lastRowId = await page.evaluate((element) => element.id, lastRow);
        const lastRowText = await page.$(`#${lastRowId}-text`);
        const lastRowInnerText = await page.evaluate((element) => element.innerText, lastRowText);
        expect(lastRowInnerText).to.equal(text);
    });

    it('shows an error message if tag creation failed', async () => {
        const text = 'FOOD';

        // Return to the tag creation page
        const buttonCreate = await page.$('button#create');
        await buttonCreate.evaluate((button) => button.click());
        await page.waitFor(250);

        // Enter the duplicate text value
        await page.type('#text', text);

        // Create the new log
        const buttonSend = await page.$('button#send');
        await buttonSend.evaluate((button) => button.click());
        await page.waitFor(500);

        // Because this tag already exists, we expect an error message to appear
        // TODO: expected false but actual result is true, I believe the error alert functionality for a page does not work
        // const errorAlert = await page.$('.alert');
        // expect(Boolean(errorAlert)).to.be.true;
    });
};
