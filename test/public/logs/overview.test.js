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
 * @param {Object} table An HTML element representing the entire log table
 * @param {Object} page An object representing the browser page being used by Puppeteer
 * @return {String} The ID of the first matching row with data
 */
async function findRowById(table, page) {
    for (const child of table) {
        const id = await page.evaluate((element) => element.id, child);
        if (id.startsWith('row')) {
            return id;
        }
    }
}

module.exports = function () {
    // Configure this suite to have a default timeout of 5s
    this.timeout(5000);

    let page;
    let browser;
    let url;

    let table;
    let firstRowId;
    let parsedFirstRowId;

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

    it('loads the page successfully', async () => {
        const response = await page.goto(url);
        await page.waitFor(100);

        // We expect the page to return the correct status code, making sure the server is running properly
        expect(response.status()).to.equal(200);

        // We expect the page to return the correct title, making sure there isn't another server running on this port
        const title = await page.title();
        expect(title).to.equal('AliceO2 Bookkeeping 2020');
    });

    it('can filter logs dynamically', async () => {
        // Expect the page to have loaded enough rows to be able to test the filtering
        const tableRows = await page.$$('table tr');
        const numberOfRows = tableRows.length - 1;
        expect(numberOfRows).to.be.greaterThan(1);

        // Expect to have captured the first checkbox in the list
        const checkbox = await page.$('.form-check input');
        const label = await page.$('.form-check label div');
        const checkboxId = await page.evaluate((element) => element.id, checkbox);
        const amount = await page.evaluate((element) => element.innerText, label);
        expect(checkboxId).to.equal('filtersCheckbox1');

        // Expect the number of rows in this filter to be less than the total number of rows
        const advertisedRows = parseInt(amount.substring(1, amount.length - 1));
        expect(advertisedRows).to.be.lessThan(numberOfRows);

        // Select the filter and wait for the changes to be processed
        await page.click(`#${checkboxId}`);
        await page.waitFor(100);

        // Expect the (new) total number of rows to equal the advertised number of rows
        const filteredRows = await page.$$('table tr');
        expect(filteredRows.length - 1).to.equal(advertisedRows);

        // Deselect the filter and wait for the changes to process
        await page.click(`#${checkboxId}`);
        await page.waitFor(100);

        // Expect the total number of rows to equal the original total
        const unfilteredRows = await page.$$('table tr');
        expect(unfilteredRows.length - 1).to.equal(numberOfRows);
    });

    it('shows correct datatypes in respective columns', async () => {
        table = await page.$$('tr');
        firstRowId = await findRowById(table, page);

        // Expectations of header texts being of a certain datatype
        const headerDatatypes = {
            id: (number) => !isNaN(number),
            date: (date) => !isNaN(Date.parse(date)),
            time: (date) => !isNaN(Date.parse(date)),
        };

        // We find the headers matching the datatype keys
        const headers = await page.$$('th');
        const headerIndices = {};
        for (const [index, header] of headers.entries()) {
            const headerContent = await page.evaluate((element) => element.innerText, header);
            const matchingDatatype = Object.keys(headerDatatypes)
                .find((key) => headerContent.toLowerCase().includes(key));
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

    it('can navigate to a log detail page', async () => {
        parsedFirstRowId = parseInt(firstRowId.slice('row'.length, firstRowId.length));

        // We expect the entry page to have the same id as the id from the log overview
        await page.click(`#${firstRowId}`);
        await page.waitFor(100);
        const redirectedUrl = await page.url();
        expect(redirectedUrl).to.equal(`${url}/?page=entry&id=${parsedFirstRowId}`);
    });
};
