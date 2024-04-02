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
    goToPage,
    fillInput,
    testTableSortingByColumn,
    pressElement,
} = require('../defaults');
const { JSON } = require('sequelize');

const { expect } = chai;

const periodNameRegex = /LHC\d\d[a-zA-Z]+/;

module.exports = () => {
    let page;
    let browser;

    before(async () => {
        [page, browser] = await defaultBefore(page, browser);
    });

    after(async () => {
        [page, browser] = await defaultAfter(page, browser);
    });

    it('loads page - simulation passes per LHC Period successfully', async () => {
        const response = await goToPage(page, 'simulation-passes-per-lhc-period-overview', { queryParameters: { lhcPeriodId: 1 } });

        // We expect the page to return the correct status code, making sure the server is running properly
        expect(response.status()).to.equal(200);

        // We expect the page to return the correct title, making sure there isn't another server running on this port
        const title = await page.title();
        expect(title).to.equal('AliceO2 Bookkeeping');
        const headerBreadcrumbs = await page.$$('h2');
        expect(await headerBreadcrumbs[0].evaluate((element) => element.innerText)).to.be.equal('Monte Carlo');
        expect(await headerBreadcrumbs[1].evaluate((element) => element.innerText)).to.be.equal('LHC22a');
    });

    it('shows correct datatypes in respective columns', async () => {
        // Expectations of header texts being of a certain datatype
        const headerDatatypes = {
            name: (name) => periodNameRegex.test(name),
            year: (year) => !isNaN(year),
            pwg: (pwg) => /PWG.+/.test(pwg),
            requestedEventsCount: (requestedEventsCount) => !isNaN(requestedEventsCount),
            generatedEventsCount: (generatedEventsCount) => !isNaN(generatedEventsCount),
            outpuSize: (outpuSize) => !isNaN(outpuSize),
        };

        // We find the headers matching the datatype keys
        await page.waitForSelector('th');
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
        await goToPage(page, 'simulation-passes-per-lhc-period-overview', { queryParameters: { lhcPeriodId: 1 } });
        await page.waitForSelector('#firstRowIndex');

        expect(await page.$eval('#firstRowIndex', (element) => parseInt(element.innerText, 10))).to.equal(1);
        expect(await page.$eval('#lastRowIndex', (element) => parseInt(element.innerText, 10))).to.equal(2);
        expect(await page.$eval('#totalRowsCount', (element) => parseInt(element.innerText, 10))).to.equal(2);
    });

    it('can set how many simulation passes is available per page', async () => {
        await goToPage(page, 'simulation-passes-per-lhc-period-overview', { queryParameters: { lhcPeriodId: 1 } });

        // Expect the amount selector to currently be set to 10 (because of the defined page height)
        await page.waitForSelector('.dropup button');
        const amountSelectorButton = await page.$('.dropup button');
        const amountSelectorButtonText = await amountSelectorButton.evaluate((element) => element.innerText);
        expect(amountSelectorButtonText.trim().endsWith('9')).to.be.true;

        // Expect the dropdown options to be visible when it is selected
        await amountSelectorButton.evaluate((button) => button.click());
        await page.waitForSelector('.dropup');
        const amountSelectorDropdown = await page.$('.dropup');
        expect(Boolean(amountSelectorDropdown)).to.be.true;

        // Expect the amount of visible simulationPasses to reduce when the first option (5) is selected
        const menuItem = await page.$('.dropup .menu-item');
        await menuItem.evaluate((button) => button.click());

        // Expect the custom per page input to have red border and text color if wrong value typed
        const customPerPageInput = await page.$('.dropup input[type=number]');
        await customPerPageInput.evaluate((input) => input.focus());

        await page.$eval('.dropup input[type=number]', (element) => {
            element.value = '1111';
            element.dispatchEvent(new Event('input'));
        });
        await page.waitForSelector('.dropup');

        expect(Boolean(await page.$('.dropup input:invalid'))).to.be.true;
    });

    it('can sort by name column in ascending and descending manners', async () => {
        await goToPage(page, 'simulation-passes-per-lhc-period-overview', { queryParameters: { lhcPeriodId: 1 } });
        await testTableSortingByColumn(page, 'name');
    });

    it('can sort by requestedEventsCount column in ascending and descending manners', async () => {
        await goToPage(page, 'simulation-passes-per-lhc-period-overview', { queryParameters: { lhcPeriodId: 1 } });
        await testTableSortingByColumn(page, 'requestedEventsCount');
    });

    it('can sort by generatedEventsCount column in ascending and descending manners', async () => {
        await goToPage(page, 'simulation-passes-per-lhc-period-overview', { queryParameters: { lhcPeriodId: 1 } });
        await testTableSortingByColumn(page, 'generatedEventsCount');
    });

    it('can sort by outputSize column in ascending and descending manners', async () => {
        await goToPage(page, 'simulation-passes-per-lhc-period-overview', { queryParameters: { lhcPeriodId: 1 } });
        await testTableSortingByColumn(page, 'outputSize');
    });

    it('should successfuly apply simulation passes name filter', async () => {
        await goToPage(page, 'simulation-passes-per-lhc-period-overview', { queryParameters: { lhcPeriodId: 1 } });
        await pressElement(page, '#openFilterToggle');

        await fillInput(page, 'div.flex-row.items-baseline:nth-of-type(2) input[type=text]', 'LHC23k6a');
        await page.waitForFunction((columnId, expectedValues) => {
            const names = [...document.querySelectorAll(`table tbody .column-${columnId}`)].map(({ innerText }) => innerText);
            return JSON.stringify(names) === JSON.stringify(expectedValues) ;
        }, { timeout: 1500 }, 'name', ['LHC23k6a']);

        await fillInput(page, 'div.flex-row.items-baseline:nth-of-type(2) input[type=text]', 'LHC23k6a, LHC23k6b');
        await page.waitForFunction((columnId, expectedValues) => {
            const names = [...document.querySelectorAll(`table tbody .column-${columnId}`)].map(({ innerText }) => innerText);
            return JSON.stringify(names) === JSON.stringify(expectedValues) ;
        }, { timeout: 1500 }, 'name', ['LHC23k6b', 'LHC23k6a']);
    });
};
