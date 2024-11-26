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
    expectInnerText,
    pressElement,
    getFirstRow,
    waitForTableLength,
    goToPage,
    reloadPage,
    getInnerText,
} = require('../defaults.js');
const { resetDatabaseContent } = require('../../utilities/resetDatabaseContent.js');

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
        await resetDatabaseContent();
    });

    after(async () => {
        [page, browser] = await defaultAfter(page, browser);
    });

    it('loads the page successfully', async () => {
        const response = await goToPage(page, 'flp-overview');

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

    it('Should display the correct items counter at the bottom of the page', async () => {
        await goToPage(page, 'flp-overview');

        await expectInnerText(page, '#firstRowIndex', '1');
        await expectInnerText(page, '#lastRowIndex', '10');
        await expectInnerText(page, '#totalRowsCount', '105');
    });

    it('can switch to infinite mode in amountSelector', async () => {
        const INFINITE_SCROLL_CHUNK = 19;
        await reloadPage(page);

        // Wait fot the table to be loaded, it should have at least 2 rows (not loading) but less than 19 rows (which is infinite scroll chunk)
        await page.waitForSelector('table tbody tr:nth-child(2)');
        expect(await page.$(`table tbody tr:nth-child(${INFINITE_SCROLL_CHUNK})`)).to.be.null;

        const amountSelectorButtonSelector = '#amountSelector button';

        // Expect the dropdown options to be visible when it is selected
        await pressElement(page, amountSelectorButtonSelector);

        const amountSelectorDropdown = await page.$('#amountSelector .dropup-menu');
        expect(Boolean(amountSelectorDropdown)).to.be.true;

        const infiniteModeButtonSelector = '#amountSelector .dropup-menu .menu-item:nth-last-child(-n +2)';
        await pressElement(page, infiniteModeButtonSelector);

        // Wait for the first chunk to be loaded
        await page.waitForSelector(`table tbody tr:nth-child(${INFINITE_SCROLL_CHUNK})`);
        expect((await getInnerText(await page.$(amountSelectorButtonSelector))).trim().endsWith('Infinite')).to.be.true;

        await page.evaluate(() => {
            document.querySelector('table tbody tr:last-child').scrollIntoView({ behavior: 'instant' });
        });

        await page.waitForSelector(`table tbody tr:nth-child(${INFINITE_SCROLL_CHUNK})`);
        expect(await page.$(`table tbody tr:nth-child(${INFINITE_SCROLL_CHUNK})`)).to.not.be.null;
    });

    it('can set how many flps are available per page', async () => {
        // Expect the amount selector to currently be set to Infinite (after the previous test)
        const amountSelectorId = '#amountSelector';
        await expectInnerText(page, `${amountSelectorId} button`, 'Rows per page: Infinite ');

        await pressElement(page, `${amountSelectorId} button`);
        await page.waitForSelector(`${amountSelectorId} .dropup-menu`);

        // Expect the amount of visible flps to reduce when the first option (5) is selected
        await pressElement(page, `${amountSelectorId} .dropup-menu .menu-item`);
        await waitForTableLength(page, 5);
    });

    it('dynamically switches between visible pages in the page selector', async () => {
        // Override the amount of flps visible per page manually
        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.flps.pagination.itemsPerPage = 1;
        });
        await waitForTableLength(page, 1);

        // Expect the page five button to now be visible, but no more than that
        const pageFiveButton = await page.$('#page5');
        expect(Boolean(pageFiveButton)).to.be.true;
        const pageSixButton = await page.$('#page6');
        expect(Boolean(pageSixButton)).to.be.false;

        // Expect the page one button to have fallen away when clicking on page five button
        await pressElement(page, '#page5');
        await page.waitForSelector('#page1', { hidden: true });
    });

    it('notifies if table loading returned an error', async () => {
        /*
         * As an example, override the amount of flps visible per page manually
         * We know the limit is 100 as specified by the Dto
         */
        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.flps.pagination.itemsPerPage = 200;
        });

        // We expect there to be a fitting error message
        await expectInnerText(page, '.alert-danger', 'Invalid Attribute: "query.page.limit" must be less than or equal to 100');

        // Revert changes for next test
        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.flps.pagination.itemsPerPage = 10;
        });
    });
};
