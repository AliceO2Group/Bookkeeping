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
        expect(title).to.equal('AliceO2 Bookkeeping 2020');
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

    it('can switch to infinite mode in amountSelector', async () => {
        const amountSelectorButton = await page.$('#amountSelector button');

        // Expect the dropdown options to be visible when it is selected
        await amountSelectorButton.evaluate((button) => button.click());
        await page.waitForTimeout(100);
        const amountSelectorDropdown = await page.$('#amountSelector .dropup-menu');
        expect(Boolean(amountSelectorDropdown)).to.be.true;

        const menuItems = await page.$$('#amountSelector .dropup-menu .menu-item');
        await menuItems[menuItems.length - 1].evaluate((button) => button.click());
        await page.waitForTimeout(100);

        const amountSelectorButtonText = await page.evaluate((element) => element.innerText, amountSelectorButton);
        expect(amountSelectorButtonText.endsWith('Infinite ')).to.be.true;

        await page.evaluate(() => {
            window.scrollBy(0, window.innerHeight);
        });
        await page.waitForTimeout(400);
        const tableRows = await page.$$('table tr');

        expect(tableRows.length > 20).to.be.true;
    });

    it('can set how many tags are available per page', async () => {
        await page.waitForTimeout(500);
        // Expect the amount selector to currently be set to Infinite (after the previous test)
        const amountSelectorId = '#amountSelector';
        await page.waitForTimeout(500);
        const amountSelectorButton = await page.$(`${amountSelectorId} button`);
        const amountSelectorButtonText = await page.evaluate((element) => element.innerText, amountSelectorButton);
        expect(amountSelectorButtonText.endsWith('Infinite ')).to.be.true;

        // Expect the dropdown options to be visible when it is selected
        await amountSelectorButton.evaluate((button) => button.click());
        await page.waitForTimeout(100);
        const amountSelectorDropdown = await page.$(`${amountSelectorId} .dropup-menu`);
        expect(Boolean(amountSelectorDropdown)).to.be.true;

        // Expect the amount of visible tags to reduce when the first option (5) is selected
        const menuItem = await page.$(`${amountSelectorId} .dropup-menu .menu-item`);
        await menuItem.evaluate((button) => button.click());
        await page.waitForTimeout(100);

        const tableRows = await page.$$('table tr');
        expect(tableRows.length - 1).to.equal(5);
    });

    it('dynamically switches between visible pages in the page selector', async () => {
        // Override the amount of Tags visible per page manually
        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.tags.setTagsPerPage(1);
        });
        await page.waitForTimeout(100);

        // Expect the page five button to now be visible, but no more than that
        const pageFiveButton = await page.$('#page5');
        expect(Boolean(pageFiveButton)).to.be.true;
        const pageSixButton = await page.$('#page6');
        expect(Boolean(pageSixButton)).to.be.false;

        // Expect the page one button to have fallen away when clicking on page five button
        await page.waitForTimeout(500);
        await page.waitForSelector('#page5');
        await pressElement(page, '#page5');
        await page.waitForTimeout(500);
        const pageOneButton = await page.$('#page1');
        expect(Boolean(pageOneButton)).to.be.false;

        // Revert changes for next test
        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.tags.setTagsPerPage(10);
        });
    });
};
