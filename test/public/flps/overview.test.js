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
 * @param {Object} table An HTML element representing the entire flp table
 * @param {Object} page An object representing the browser page being used by Puppeteer
 * @return {Promise<String>} The ID of the first matching row with data
 */
async function getFirstRow(table, page) {
    for await (const child of table) {
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
        await page.setViewport({
            width: 700,
            height: 720,
            deviceScaleFactor: 1,
        });

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

    it('loads the page successfully', async () => {
        const response = await page.goto(`${url}?page=flp-overview`, { waitUntil: 'networkidle0' });

        // We expect the page to return the correct status code, making sure the server is running properly
        expect(response.status()).to.equal(200);

        // We expect the page to return the correct title, making sure there isn't another server running on this port
        const title = await page.title();
        expect(title).to.equal('AliceO2 Bookkeeping 2020');
    });

    it('shows correct datatypes in respective columns', async () => {
        table = await page.$$('tr');
        firstRowId = await getFirstRow(table, page);

        // Expectations of header texts being of a certain datatype
        const headerDatatypes = {
            name: (string) => typeof string == 'string',
            hostname: (string) => typeof string == 'string',
            nTimeframes: (number) => typeof number == 'number',
            bytesProcessed: (number) => typeof number == 'number',
            bytesEquipmentReadOut: (number) => typeof number == 'number',
            bytesRecordingReadOut: (number) => typeof number == 'number',
            bytesFairMQReadOut: (number) => typeof number == 'number',
        };

        // We find the headers matching the datatype keys
        const headers = await page.$$('th');
        const headerIndices = {};
        for (const [index, header] of headers.entries()) {
            const headerContent = await page.evaluate((element) => element.id, header);
            const matchingDatatype = Object.keys(headerDatatypes).find((key) => headerContent === key);
            if (matchingDatatype !== undefined) {
                headerIndices[index] = matchingDatatype;
            }
        }

        // We expect every value of a header matching a datatype key to actually be of that datatype
        const firstRowCells = await page.$$(`#${firstRowId} td`);
        for (const [index, cell] of firstRowCells.entries()) {
            if (Object.keys(headerIndices).includes(index)) {
                const cellContent = await page.evaluate((element) => element.innerText, cell);
                const expectedDatatype = headerDatatypes[headerIndices[index]](cellContent);
                expect(expectedDatatype).to.be.true;
            }
        }
    });

    it('can set how many flps are available per page', async () => {
        // Expect the amount selector to currently be set to 10 pages
        const amountSelectorId = '#amountSelector';
        const amountSelectorButton = await page.$(`${amountSelectorId} button`);
        const amountSelectorButtonText = await page.evaluate((element) => element.innerText, amountSelectorButton);
        expect(amountSelectorButtonText.endsWith('10 ')).to.be.true;

        // Expect the dropdown options to be visible when it is selected
        await amountSelectorButton.evaluate((button) => button.click());
        await page.waitForTimeout(100);
        const amountSelectorDropdown = await page.$(`${amountSelectorId} .dropdown-menu`);
        expect(Boolean(amountSelectorDropdown)).to.be.true;

        // Expect the amount of visible flps to reduce when the first option (5) is selected
        const menuItem = await page.$(`${amountSelectorId} .dropdown-menu .menu-item`);
        await menuItem.evaluate((button) => button.click());
        await page.waitForTimeout(100);

        const tableRows = await page.$$('table tr');
        expect(tableRows.length - 1).to.equal(5);
    });

    it('can switch between pages of flps', async () => {
        // Expect the page selector to be available with two pages
        const pageSelectorId = '#amountSelector';
        const pageSelector = await page.$(pageSelectorId);
        expect(Boolean(pageSelector)).to.be.true;
        const pageSelectorButtons = await page.$$('#pageSelector .btn-tab');
        expect(pageSelectorButtons.length).to.equal(2);

        // Expect the table rows to change upon page navigation
        const oldFirstRowId = await getFirstRow(table, page);
        const secondPage = await page.$('#page2');
        await secondPage.evaluate((button) => button.click());
        await page.waitForTimeout(100);
        table = await page.$$('tr');
        const newFirstRowId = await getFirstRow(table, page);
        expect(oldFirstRowId).to.not.equal(newFirstRowId);

        // Expect us to be able to do the same with the page arrows
        const prevPage = await page.$('#pageMoveLeft');
        await prevPage.evaluate((button) => button.click());
        await page.waitForTimeout(100);
        const oldFirstPageButton = await page.$('#page1');
        const oldFirstPageButtonClass = await page.evaluate((element) => element.className, oldFirstPageButton);
        expect(oldFirstPageButtonClass).to.include('selected');

        // The same, but for the other (right) arrow
        const nextPage = await page.$('#pageMoveRight');
        await nextPage.evaluate((button) => button.click());
        await page.waitForTimeout(100);
        const newFirstPageButton = await page.$('#page1');
        const newFirstPageButtonClass = await page.evaluate((element) => element.className, newFirstPageButton);
        expect(newFirstPageButtonClass).to.not.include('selected');
    });

    it('dynamically switches between visible pages in the page selector', async () => {
        // Override the amount of flps visible per page manually
        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.flps.setFlpsPerPage(1);
        });
        await page.waitForTimeout(100);

        // Expect the page five button to now be visible, but no more than that
        const pageFiveButton = await page.$('#page5');
        expect(Boolean(pageFiveButton)).to.be.true;
        const pageSixButton = await page.$('#page6');
        expect(Boolean(pageSixButton)).to.be.false;

        // Expect the page one button to have fallen away when clicking on page five button
        await page.click('#page5');
        await page.waitForTimeout(100);
        const pageOneButton = await page.$('#page1');
        expect(Boolean(pageOneButton)).to.be.false;
    });

    it('notifies if table loading returned an error', async () => {
        /*
         * As an example, override the amount of flps visible per page manually
         * We know the limit is 100 as specified by the Dto
         */
        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.flps.setFlpsPerPage(200);
        });
        await page.waitForTimeout(100);

        // We expect there to be a fitting error message
        const error = await page.$('.alert-danger');
        expect(Boolean(error)).to.be.true;
        const message = await page.evaluate((element) => element.innerText, error);
        expect(message).to.equal('Invalid Attribute: "query.page.limit" must be less than or equal to 100');

        // Revert changes for next test
        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.flps.setFlpsPerPage(10);
        });
        await page.waitForTimeout(100);
    });

    it('can navigate to a flp detail page', async () => {
        table = await page.$$('tr');
        firstRowId = await getFirstRow(table, page);
        const parsedFirstRowId = parseInt(firstRowId.slice('row'.length, firstRowId.length), 10);

        // We expect the entry page to have the same id as the id from the flp overview
        await page.click(`#${firstRowId}`);
        await page.waitForTimeout(100);
        const redirectedUrl = await page.url();
        expect(String(redirectedUrl).startsWith(`${url}/?page=flp-detail&id=${parsedFirstRowId}`)).to.be.true;
    });
};
