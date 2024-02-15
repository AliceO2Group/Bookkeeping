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
const {
    defaultBefore,
    defaultAfter,
    pressElement,
    getFirstRow,
    goToPage,
    checkColumnBalloon,
    checkEnvironmentStatusColor,
} = require('../defaults');
const { waitForNetworkIdleAndRedraw, waitForTimeout } = require('../defaults.js');

const { expect } = chai;

module.exports = () => {
    let page;
    let browser;

    let table;
    let firstRowId;

    before(async () => {
        [page, browser] = await defaultBefore(page, browser);
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
        const response = await goToPage(page, 'env-overview');

        // We expect the page to return the correct status code, making sure the server is running properly
        expect(response.status()).to.equal(200);

        // We expect the page to return the correct title, making sure there isn't another server running on this port
        const title = await page.title();
        expect(title).to.equal('AliceO2 Bookkeeping');
    });

    it('shows correct datatypes in respective columns', async () => {
        table = await page.$$('tr');
        firstRowId = await getFirstRow(table, page);

        // Expectations of header texts being of a certain datatype
        const headerDatatypes = {
            id: (string) => typeof string == 'string',
            createdAt: (date) => !isNaN(Date.parse(date)),
            updatedAt: (date) => !isNaN(Date.parse(date)),
            toredownAt: (date) => !isNaN(Date.parse(date)),
            status: (date) => !isNaN(Date.parse(date)),
            statusMessage: (string) => typeof string == 'string',
            runs: (string) => typeof string == 'string',
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

    it('Should display the correct items counter at the bottom of the page', async () => {
        await goToPage(page, 'env-overview');
        await waitForTimeout(100);

        expect(await page.$eval('#firstRowIndex', (element) => parseInt(element.innerText, 10))).to.equal(1);
        expect(await page.$eval('#lastRowIndex', (element) => parseInt(element.innerText, 10))).to.equal(10);
        expect(await page.$eval('#totalRowsCount', (element) => parseInt(element.innerText, 10))).to.equal(11);
    });

    it('Should have balloon on runs column', async () => {
        await goToPage(page, 'env-overview');
        await waitForTimeout(100);

        await checkColumnBalloon(page, 1, 2);
        await checkColumnBalloon(page, 1, 6);
    });

    it('Should have correct status color in the overview page', async () => {
        await goToPage(page, 'env-overview');
        await waitForTimeout(100);

        await checkEnvironmentStatusColor(page, 1, 4);
        await checkEnvironmentStatusColor(page, 2, 4);
        await checkEnvironmentStatusColor(page, 3, 4);
        await checkEnvironmentStatusColor(page, 4, 4);
    });

    it('can set how many environments are available per page', async () => {
        await waitForTimeout(300);
        // Expect the amount selector to currently be set to 10 (because of the defined page height)
        const amountSelectorId = '#amountSelector';
        const amountSelectorButton = await page.$(`${amountSelectorId} button`);
        const amountSelectorButtonText = await page.evaluate((element) => element.innerText, amountSelectorButton);
        await waitForTimeout(300);
        expect(amountSelectorButtonText.trim().endsWith('10')).to.be.true;

        // Expect the dropdown options to be visible when it is selected
        await amountSelectorButton.evaluate((button) => button.click());
        await waitForTimeout(100);
        const amountSelectorDropdown = await page.$(`${amountSelectorId} .dropup-menu`);
        expect(Boolean(amountSelectorDropdown)).to.be.true;

        // Expect the amount of visible environments to reduce when the first option (5) is selected
        const menuItem = await page.$(`${amountSelectorId} .dropup-menu .menu-item`);
        await menuItem.evaluate((button) => button.click());
        await waitForTimeout(100);

        const tableRows = await page.$$('table tr');
        expect(tableRows.length - 1).to.equal(5);

        // Expect the custom per page input to have red border and text color if wrong value typed
        const customPerPageInput = await page.$(`${amountSelectorId} input[type=number]`);
        await customPerPageInput.evaluate((input) => input.focus());
        await page.$eval(`${amountSelectorId} input[type=number]`, (el) => {
            el.value = '1111';
            el.dispatchEvent(new Event('input'));
        });
        await waitForTimeout(100);
        expect(Boolean(await page.$(`${amountSelectorId} input:invalid`))).to.be.true;
    });

    it('dynamically switches between visible pages in the page selector', async () => {
        await goToPage(page, 'env-overview');

        // Override the amount of runs visible per page manually
        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.envs.overviewModel.pagination.itemsPerPage = 1;
        });
        await waitForTimeout(100);

        // Expect the page five button to now be visible, but no more than that
        const pageFiveButton = await page.$('#page5');
        expect(Boolean(pageFiveButton)).to.be.true;
        const pageSixButton = await page.$('#page6');
        expect(Boolean(pageSixButton)).to.be.false;

        // Expect the page one button to have fallen away when clicking on page five button
        await pressElement(page, '#page5');
        await waitForTimeout(100);
        const pageOneButton = await page.$('#page1');
        expect(Boolean(pageOneButton)).to.be.false;
    });

    it('should successfully display the list of related runs as hyperlinks to their details page', async () => {
        await goToPage(page, 'env-overview');
        await pressElement(page, '#rowTDI59So3d-runs a');
        await waitForNetworkIdleAndRedraw(page);
        const [, parametersExpr] = await page.url().split('?');
        const urlParameters = parametersExpr.split('&');
        expect(urlParameters).to.contain('page=run-detail');
    });
};
