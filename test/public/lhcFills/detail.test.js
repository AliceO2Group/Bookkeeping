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

const { defaultBefore, defaultAfter, expectInnerText } = require('../defaults.js');
const { expect } = require('chai');

module.exports = () => {
    let page;
    let browser;
    let url;

    before(async () => {
        [page, browser, url] = await defaultBefore();
    });

    it('should successfully display lhc fills details page', async () => {
        await page.goto(`${url}/?page=lhc-fill-details&fillNumber=1`, { waitUntil: 'networkidle0' });
        await expectInnerText(page, 'h2', 'Fill No. 1');
    });

    it('should successfully emphasize the fills that have a stable beams', async () => {
        // Fill #1 has a stable beam
        const stableBeamBadge = await page.$('#stable-beam-badge');
        expect(stableBeamBadge).to.be.not.null;
    });

    it('should successfully display runs related to the fill', async () => {
        const runsTable = await page.$$('#runs tbody tr');
        expect(runsTable.length).to.be.greaterThan(0);
    });

    it('should successfully navigate to run detail page', async () => {
        const row = await page.$('#runs tbody tr');
        expect(row).to.be.not.null;
        // Remove "row" prefix to get fill number
        const runId = await row.evaluate((element) => element.id.slice(3));

        await row.$eval('td:first-of-type a', (link) => link.click());
        await page.waitForNetworkIdle();
        await page.waitForTimeout(100);
        const redirectedUrl = await page.url();
        const urlParameters = redirectedUrl.slice(redirectedUrl.indexOf('?') + 1).split('&');

        expect(urlParameters).to.contain('page=run-detail');
        expect(urlParameters).to.contain(`id=${runId}`);
    });

    after(async () => {
        await defaultAfter(page, browser);
    });
};
