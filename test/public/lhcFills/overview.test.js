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
    goToPage,
    checkColumnBalloon,
} = require('../defaults');
const { waitForNetworkIdleAndRedraw, waitForTimeout, expectInnerText } = require('../defaults.js');
const { resetDatabaseContent } = require('../../utilities/resetDatabaseContent.js');

const { expect } = chai;

const percentageRegex = new RegExp(/\d{1,2}.\d{2}%/);
const durationRegex = new RegExp(/\d{2}:\d{2}:\d{2}/);

module.exports = () => {
    let page;
    let browser;

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
        const response = await goToPage(page, 'lhc-fill-overview');

        // We expect the page to return the correct status code, making sure the server is running properly
        expect(response.status()).to.equal(200);

        // We expect the page to return the correct title, making sure there isn't another server running on this port
        const title = await page.title();
        expect(title).to.equal('AliceO2 Bookkeeping');
    });

    it('shows correct datatypes in respective columns', async () => {
        // Expectations of header texts being of a certain datatype
        const headerDatatypes = {
            fillNumber: (fill) => !isNaN(parseInt(fill, 10)),
            // Seems to not exist anymore
            createdAt: (date) => !isNaN(Date.parse(date)),
            // Seems to not exist anymore
            updatedAt: (date) => !isNaN(Date.parse(date)),
            // Seems to not exist anymore
            toredownAt: (date) => !isNaN(Date.parse(date)),
            // Seems to not exist anymore
            status: (date) => !isNaN(Date.parse(date)),
            // Seems to not exist anymore
            statusMessage: (string) => typeof string == 'string',
            efficiency: (efficiency) => efficiency === '-' || efficiency.match(percentageRegex) !== null,
            timeLossAtStart: (data) => data === '-'
                || data.match(new RegExp(`${durationRegex.source}\n\\(${percentageRegex.source}\\)`)) !== null,
            timeLossAtEnd: (data) => data === '-'
                || data.match(new RegExp(`${durationRegex.source}\n\\(${percentageRegex.source}\\)`)) !== null,
            meanRunDuration: (duration) => duration === '-' || duration.match(durationRegex) !== null,
            runsCoverage: (duration) => duration === '-' || duration.match(durationRegex) !== null,
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

        // Use the third row because it is where statistics are present
        const firstRowCells = await page.$$('tr:nth-of-type(3) td');
        for (const [index, cell] of firstRowCells.entries()) {
            if (index in headerIndices) {
                const cellContent = await page.evaluate((element) => element.innerText, cell);
                const expectedDatatype = headerDatatypes[headerIndices[index]](cellContent);
                expect(expectedDatatype).to.be.true;
            }
        }
    });

    it('Should display the correct items counter at the bottom of the page', async () => {
        await goToPage(page, 'lhc-fill-overview');
        await waitForTimeout(100);

        expect(await page.$eval('#firstRowIndex', (element) => parseInt(element.innerText, 10))).to.equal(1);
        expect(await page.$eval('#lastRowIndex', (element) => parseInt(element.innerText, 10))).to.equal(6);
        expect(await page.$eval('#totalRowsCount', (element) => parseInt(element.innerText, 10))).to.equal(6);
    });

    it('Should have balloon on runs column', async () => {
        await goToPage(page, 'lhc-fill-overview');
        await waitForTimeout(100);

        await checkColumnBalloon(page, 1, 12);
    });

    it('can set how many lhcFills are available per page', async () => {
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

        // Expect the amount of visible lhcfills to reduce when the first option (5) is selected
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
        await goToPage(page, 'lhc-fill-overview');

        // Override the amount of lhc fills visible per page manually
        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.lhcFills.overviewModel.pagination.itemsPerPage = 1;
        });
        await waitForTimeout(100);

        // Expect the page five button to now be visible, but no more than that
        const pageFiveButton = await page.$('#page5');
        expect(pageFiveButton).to.be.not.null;
        const pageSixButton = await page.$('#page6');
        expect(pageSixButton).to.be.null;

        // Expect the page one button to have fallen away when clicking on page five button
        await pressElement(page, '#page5');
        await waitForTimeout(100);
        const pageOneButton = await page.$('#page1');
        expect(pageOneButton).to.be.null;
    });

    it('should successfully navigate to the LHC fill details page', async () => {
        await goToPage(page, 'lhc-fill-overview');
        await waitForTimeout(200);

        // Use the third row to have a fill with statistics
        const row = await page.$('tbody tr:nth-of-type(3)');
        expect(row).to.be.not.null;
        // Remove "row" prefix to get fill number
        const fillNumber = await row.evaluate((element) => element.id.slice(3));

        await row.$eval('td:first-of-type a', (link) => link.click());
        await page.waitForNetworkIdle();
        await waitForTimeout(200);
        const redirectedUrl = await page.url();
        const urlParameters = redirectedUrl.slice(redirectedUrl.indexOf('?') + 1).split('&');

        expect(urlParameters).to.contain('page=lhc-fill-details');
        expect(urlParameters).to.contain(`fillNumber=${fillNumber}`);
    });

    it('should successfully display ONGOING information', async () => {
        await goToPage(page, 'lhc-fill-overview');
        const stableBeamsDurationText = await page.$('#row5-stableBeamsDuration-text');
        expect(await stableBeamsDurationText.evaluate((element) => element.classList.contains('bg-success')));
        expect(await stableBeamsDurationText.evaluate((element) => element.innerText)).to.equal('ONGOING');
    });

    it('should successfully display the list of related runs as hyperlinks to their details page', async () => {
        await goToPage(page, 'lhc-fill-overview');
        await pressElement(page, '#row6-runs a');
        await waitForNetworkIdleAndRedraw(page);
        const [, parametersExpr] = await page.url().split('?');
        const urlParameters = parametersExpr.split('&');
        expect(urlParameters).to.contain('page=run-detail');
    });

    it ('should successfully display some statistics', async () => {
        await goToPage(page, 'lhc-fill-overview');
        await expectInnerText(page, 'tbody tr:nth-child(1) td:nth-child(6)', '41.67%');
        await expectInnerText(page, 'tbody tr:nth-child(1) td:nth-child(7)', '03:00:00\n(25.00%)');
        await expectInnerText(page, 'tbody tr:nth-child(1) td:nth-child(8)', '02:00:00\n(16.67%)');
        await expectInnerText(page, 'tbody tr:nth-child(1) td:nth-child(9)', '01:40:00');
        await expectInnerText(page, 'tbody tr:nth-child(1) td:nth-child(10)', '05:00:00');
    });
};
