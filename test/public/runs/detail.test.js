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
const { defaultBefore, defaultAfter, expectInnerText, pressElement } = require('../defaults');

const { expect } = chai;

/**
 * Special method built due to Puppeteer limitations: looks for the first row matching an ID in a table
 * @param {Object} table An HTML element representing the entire run table
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
        [page, browser, url] = await defaultBefore(page, browser);
    });
    after(async () => {
        [page, browser] = await defaultAfter(page, browser);
    });

    it('run detail loads correctly', async () => {
        await page.goto(`${url}/?page=run-detail&id=1`, { waitUntil: 'networkidle0' });
        await expectInnerText(page, 'h2', 'Run #1');
    });

    it('can navigate to the log panel', async () => {
        await pressElement(page, '#logs-tab');
        await page.waitForTimeout(100);
        const redirectedUrl = await page.url();
        expect(String(redirectedUrl).startsWith(`${url}/?page=run-detail&id=1&panel=logs`)).to.be.true;
    });

    it('can navigate to the main panel', async () => {
        await pressElement(page, '#main-tab');
        await page.waitForTimeout(100);
        const redirectedUrl = await page.url();
        expect(String(redirectedUrl).startsWith(`${url}/?page=run-detail&id=1&panel=main`)).to.be.true;
    });

    it('can navigate to the log panel', async () => {
        await pressElement(page, '#logs-tab');
        await page.waitForTimeout(100);
        const redirectedUrl = await page.url();
        expect(String(redirectedUrl).startsWith(`${url}/?page=run-detail&id=1&panel=logs`)).to.be.true;
    });

    it('can navigate to a log detail page', async () => {
        table = await page.$$('tr');
        firstRowId = await getFirstRow(table, page);

        // We expect the entry page to have the same id as the id from the run overview
        await pressElement(page, `#${firstRowId}`);
        await page.waitForTimeout(100);
        const redirectedUrl = await page.url();
        expect(String(redirectedUrl).startsWith(`${url}/?page=log-detail&id=1`)).to.be.true;
    });

    it('notifies if a specified run id is invalid', async () => {
        // Navigate to a run detail view with an id that cannot exist
        await page.goto(`${url}/?page=run-detail&id=abc`, { waitUntil: 'networkidle0' });

        // We expect there to be an error message
        await expectInnerText(page, '.alert', 'Invalid Attribute: "params.runId" must be a number');
    });

    it('notifies if a specified run id is not found', async () => {
        // Navigate to a run detail view with an id that cannot exist
        await page.goto(`${url}/?page=run-detail&id=999`, { waitUntil: 'networkidle0' });

        // We expect there to be an error message
        await expectInnerText(page, '.alert', 'Run with this id (999) could not be found');
    });

    it('can return to the overview page if an error occurred', async () => {
        // We expect there to be a button to return to the overview page
        await expectInnerText(page, '.btn-primary', 'Return to Overview');

        // We expect the button to return the user to the overview page when pressed
        await pressElement(page, '.btn-primary');
        await page.waitForTimeout(100);
        expect(page.url()).to.equal(`${url}/?page=run-overview`);
    });
};
