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
const { defaultBefore, defaultAfter, getFirstRow, goToPage, waitForNavigation, pressElement, expectUrlParams } = require('../defaults.js');
const { resetDatabaseContent } = require('../../utilities/resetDatabaseContent.js');

const { expect } = chai;

module.exports = () => {
    let page;
    let browser;

    let table;
    let firstRowId;

    before(async () => {
        [page, browser] = await defaultBefore(page, browser);
        await resetDatabaseContent();
    });
    after(async () => {
        [page, browser] = await defaultAfter(page, browser);
    });

    it('loads the page successfully', async () => {
        const response = await goToPage(page, 'home');

        // We expect the page to return the correct status code, making sure the server is running properly
        expect(response.status()).to.equal(200);

        // We expect the page to return the correct title, making sure there isn't another server running on this port
        const title = await page.title();
        expect(title).to.equal('AliceO2 Bookkeeping');
    });

    it('should successfully display logs table', async () => {
        await page.waitForSelector('#logs-panel tr#row119');
    });

    it('shows correct datatypes in respective columns', async () => {
        await page.waitForSelector('#runs-panel');
        table = await page.$$('#runs-panel tr');
        firstRowId = await getFirstRow(table, page);

        // Expectations of header texts being of a certain datatype
        const headerDatatypes = {
            runNumber: (number) => typeof number == 'number',
            timeO2Start: (date) => !isNaN(Date.parse(date)),
            timeO2End: (date) => !isNaN(Date.parse(date)),
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

    it('can navigate to a detail page via link', async () => {
        // We expect the entry page to have the same id as the id from the log overview
        await waitForNavigation(page, () => pressElement(page, '#logs-panel a.btn-redirect'));

        expectUrlParams(page, { page: 'log-detail', id: 119 });
    });
};
