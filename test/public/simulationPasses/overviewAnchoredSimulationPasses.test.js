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
    getAllDataFields,
    fillInput,
    waitForTableDataReload,
    validateTableData,
} = require('../defaults');

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
        const response = await goToPage(page, 'anchored-simulation-passes-overview', { queryParameters: { dataPassId: 3 } });

        // We expect the page to return the correct status code, making sure the server is running properly
        expect(response.status()).to.equal(200);

        // We expect the page to return the correct title, making sure there isn't another server running on this port
        const title = await page.title();
        expect(title).to.equal('AliceO2 Bookkeeping');
        const headerBreadcrumbs = await page.$$('h2');
        expect(await headerBreadcrumbs[0].evaluate((element) => element.innerText)).to.be.equal('Anchored MC');
        expect(await headerBreadcrumbs[1].evaluate((element) => element.innerText)).to.be.equal('LHC22a_apass1');
    });

    it('shows correct datatypes in respective columns', async () => {
        await goToPage(page, 'anchored-simulation-passes-overview', { queryParameters: { dataPassId: 3 } });

        // Expectations of header texts being of a certain datatype
        const tableValidators = {
            name: (name) => periodNameRegex.test(name),
            year: (year) => !isNaN(year),
            pwg: (pwg) => /PWG.+/.test(pwg),
            requestedEventsCount: (requestedEventsCount) => !isNaN(requestedEventsCount.replace(/,/g, '')),
            generatedEventsCount: (generatedEventsCount) => !isNaN(generatedEventsCount.replace(/,/g, '')),
            outpuSize: (outpuSize) => !isNaN(outpuSize),
        };

        await validateTableData(page, tableValidators);
    });

    it('Should display the correct items counter at the bottom of the page', async () => {
        await goToPage(page, 'anchored-simulation-passes-overview', { queryParameters: { dataPassId: 3 } });
        await page.waitForSelector('#firstRowIndex');

        expect(await page.$eval('#firstRowIndex', (element) => parseInt(element.innerText, 10))).to.equal(1);
        expect(await page.$eval('#lastRowIndex', (element) => parseInt(element.innerText, 10))).to.equal(2);
        expect(await page.$eval('#totalRowsCount', (element) => parseInt(element.innerText, 10))).to.equal(2);
    });

    it('can set how many simulation passes is available per page', async () => {
        await goToPage(page, 'anchored-simulation-passes-overview', { queryParameters: { dataPassId: 3 } });

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
        await goToPage(page, 'anchored-simulation-passes-overview', { queryParameters: { dataPassId: 3 } });
        // Expect a sorting preview to appear when hovering over a column header
        await page.waitForSelector('th#name');
        await page.hover('th#name');
        const sortingPreviewIndicator = await page.$('#name-sort-preview');
        expect(Boolean(sortingPreviewIndicator)).to.be.true;

        // Sort by name in an ascending manner
        const nameHeader = await page.$('th#name');
        await waitForTableDataReload(page, () => nameHeader.evaluate((button) => button.click()));

        // Expect the names to be in alphabetical order
        const firstNames = await getAllDataFields(page, 'name');
        expect(firstNames).to.have.all.deep.ordered.members(firstNames.sort());
    });

    it('can sort by requestedEventsCount column in ascending and descending manners', async () => {
        await goToPage(page, 'anchored-simulation-passes-overview', { queryParameters: { dataPassId: 3 } });
        // Expect a sorting preview to appear when hovering over a column header
        await page.waitForSelector('th#requestedEventsCount');
        await page.hover('th#requestedEventsCount');
        const sortingPreviewIndicator = await page.$('#requestedEventsCount-sort-preview');
        expect(Boolean(sortingPreviewIndicator)).to.be.true;

        // Sort by year in an ascending manner
        const requestedEventsCountHeader = await page.$('th#requestedEventsCount');
        await requestedEventsCountHeader.evaluate((button) => button.click());
        await waitForTableDataReload(page, () => requestedEventsCountHeader.evaluate((button) => button.click()));

        // Expect the year to be in order
        const firstReconstructedEventsCounts = await getAllDataFields(page, 'requestedEventsCount');
        expect(firstReconstructedEventsCounts).to.have.all.deep.ordered.members(firstReconstructedEventsCounts.sort());
    });

    it('can sort by generatedEventsCount column in ascending and descending manners', async () => {
        await goToPage(page, 'anchored-simulation-passes-overview', { queryParameters: { dataPassId: 3 } });
        // Expect a sorting preview to appear when hovering over a column header
        await page.waitForSelector('th#generatedEventsCount');
        await page.hover('th#generatedEventsCount');
        const sortingPreviewIndicator = await page.$('#generatedEventsCount-sort-preview');
        expect(Boolean(sortingPreviewIndicator)).to.be.true;

        // Sort by year in an ascending manner
        const generatedEventsCountHeader = await page.$('th#generatedEventsCount');
        await generatedEventsCountHeader.evaluate((button) => button.click());
        await waitForTableDataReload(page, () => generatedEventsCountHeader.evaluate((button) => button.click()));

        // Expect the year to be in order
        const firstReconstructedEventsCounts = await getAllDataFields(page, 'generatedEventsCount');
        expect(firstReconstructedEventsCounts).to.have.all.deep.ordered.members(firstReconstructedEventsCounts.sort());
    });

    it('can sort by outputSize column in ascending and descending manners', async () => {
        await goToPage(page, 'anchored-simulation-passes-overview', { queryParameters: { dataPassId: 3 } });
        // Expect a sorting preview to appear when hovering over a column header
        await page.waitForSelector('th#outputSize');
        await page.hover('th#outputSize');
        const sortingPreviewIndicator = await page.$('#outputSize-sort-preview');
        expect(Boolean(sortingPreviewIndicator)).to.be.true;

        // Sort by avgCenterOfMassEnergy in an ascending manner
        const outputSizeHeader = await page.$('th#outputSize');
        await outputSizeHeader.evaluate((button) => button.click());
        await waitForTableDataReload(page, () => outputSizeHeader.evaluate((button) => button.click()));

        // Expect the avgCenterOfMassEnergy to be in order
        const firstOutputSize = await getAllDataFields(page, 'outputSize');
        expect(firstOutputSize).to.have.all.deep.ordered.members(firstOutputSize.sort());
    });

    it('should successfuly apply simulation passes name filter', async () => {
        await goToPage(page, 'anchored-simulation-passes-overview', { queryParameters: { dataPassId: 3 } });
        await page.waitForSelector('#openFilterToggle');
        const filterToggleButton = await page.$('#openFilterToggle');
        expect(filterToggleButton).to.not.be.null;

        // 1
        await filterToggleButton.evaluate((button) => button.click());
        await waitForTableDataReload(page, () => fillInput(page, 'div.flex-row.items-baseline:nth-of-type(2) input[type=text]', 'LHC23k6a'));

        let allDataPassesNames = await getAllDataFields(page, 'name');
        expect(allDataPassesNames).to.has.all.deep.members(['LHC23k6a']);

        // 2
        await waitForTableDataReload(page, () => fillInput(
            page,
            'div.flex-row.items-baseline:nth-of-type(2) input[type=text]',
            'LHC23k6a, LHC23k6b',
        ));

        allDataPassesNames = await getAllDataFields(page, 'name');
        expect(allDataPassesNames).to.has.all.deep.members(['LHC23k6a', 'LHC23k6b']);
    });
};
