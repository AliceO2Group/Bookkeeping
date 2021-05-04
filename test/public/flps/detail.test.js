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

module.exports = () => {
    let page;
    let browser;
    let url;

    before(async () => {
        [page, browser, url] = await defaultBefore(page, browser);
    });
    after(async () => {
        [page, browser] = await defaultAfter(page, browser);
    });

    it('flp detail loads correctly', async () => {
        await page.goto(`${url}/?page=flp-detail&id=1`, { waitUntil: 'networkidle0' });
        await expectInnerText(page, 'h2', 'Flp #FLP-TPC-1');
    });

    /*
     * It('can navigate to the log panel', async () => {
     *     await pressElement(page, '#logs-tab');
     *     await page.waitForTimeout(100);
     *     const redirectedUrl = await page.url();
     *     expect(String(redirectedUrl).startsWith(`${url}/?page=flp-detail&id=1&panel=logs`)).to.be.true;
     * });
     */

    it('can navigate to the main panel', async () => {
        await pressElement(page, '#main-tab');
        await page.waitForTimeout(100);
        const redirectedUrl = await page.url();
        expect(String(redirectedUrl).startsWith(`${url}/?page=flp-detail&id=1&panel=main`)).to.be.true;
    });

    /*
     * It('can navigate to the log panel', async () => {
     *     await pressElement(page, '#logs-tab');
     *     await page.waitForTimeout(100);
     *     const redirectedUrl = await page.url();
     *     expect(String(redirectedUrl).startsWith(`${url}/?page=flp-detail&id=1&panel=logs`)).to.be.true;
     * });
     */

    /*
     * It('can navigate to a log detail page', async () => {
     *     table = await page.$$('tr');
     *     firstRowId = await getFirstRow(table, page);
     */

    /*
     *     // We expect the entry page to have the same id as the id from the flp overview
     *     await pressElement(page, `#${firstRowId}`);
     *     await page.waitForTimeout(100);
     *     const redirectedUrl = await page.url();
     *     expect(String(redirectedUrl).startsWith(`${url}/?page=log-detail&id=1`)).to.be.true;
     * });
     */

    it('notifies if a specified flp id is invalid', async () => {
        // Navigate to a flp detail view with an id that cannot exist
        await page.goto(`${url}/?page=flp-detail&id=abc`, { waitUntil: 'networkidle0' });

        // We expect there to be an error message
        await expectInnerText(page, '.alert', 'Invalid Attribute: "params.flpId" must be a number');
    });

    it('notifies if a specified flp id is not found', async () => {
        // Navigate to a flp detail view with an id that cannot exist
        await page.goto(`${url}/?page=flp-detail&id=999`, { waitUntil: 'networkidle0' });

        // We expect there to be an error message
        await expectInnerText(page, '.alert', 'Flp with this id (999) could not be found');
    });

    it('allows navigating to an associated run', async () => {
        const flpRoleId = 1;
        const runId = 1;

        // Navigate to a flp detail view
        await page.goto(`${url}/?page=flp-detail&id=${flpRoleId}`, { waitUntil: 'networkidle0' });
        // We expect the correct associated runs to be shown
        const runField = await page.$('#Flp-runs');
        const runText = await page.evaluate((element) => element.innerText, runField);
        expect(runText).to.equal(`Runs:\n${runId}`);

        // We expect the associated runs to be clickable with a valid link
        const runLink = await page.$('#Flp-runs a');
        await runLink.click();
        await page.waitForTimeout(1000);

        // We expect the link to navigate to the correct run detail page
        const redirectedUrl = await page.url();
        expect(redirectedUrl).to.equal(`${url}/?page=run-detail&id=${runId}&panel=main`);
    });

    /*
     * It('can return to the overview page if an error occurred', async () => {
     *     await page.goto(`${url}/?page=flp-detail&id=1`, { waitUntil: 'networkidle0' });
     *     // We expect there to be a button to return to the overview page
     *     await expectInnerText(page, '.btn-primary', 'Return to Overview');
     */

    /*
     *     // We expect the button to return the user to the overview page when pressed
     *     await pressElement(page, '.btn-primary');
     *     await page.waitForTimeout(100);
     *     expect(page.url()).to.equal(`${url}/?page=flp-overview`);
     * });
     */
};
