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

    it('loads the page successfully', async () => {
        const response = await goToPage(page, 'lhc-period-overview');

        // We expect the page to return the correct status code, making sure the server is running properly
        expect(response.status()).to.equal(200);

        // We expect the page to return the correct title, making sure there isn't another server running on this port
        const title = await page.title();
        expect(title).to.equal('AliceO2 Bookkeeping');
    });

    it('shows correct datatypes in respective columns', async () => {
        const allowedBeamTypesDisplayes = new Set(['-', 'XeXe', 'PbPb', 'pp']);
        // Expectations of header texts being of a certain datatype
        const headerDatatypes = {
            name: (name) => periodNameRegex.test(name),
            associatedRuns: (display) => /(No runs)|(\d+\nRuns)/.test(display),
            associatedDataPasses: (display) => /(No data passes)|(\d+\nData Passes)/.test(display),
            year: (year) => !isNaN(year),
            beamType: (beamType) => allowedBeamTypesDisplayes.has(beamType),
            avgCenterOfMassEnergy: (avgCenterOfMassEnergy) => !isNaN(avgCenterOfMassEnergy),
            distinctEnergies: (distinctEnergies) => (distinctEnergies === '-' ? [] : distinctEnergies)
                .split(',')
                .every((energy) => !isNaN(energy)),
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
        await goToPage(page, 'lhc-period-overview');
        await page.waitForTimeout(100);

        expect(await page.$eval('#firstRowIndex', (element) => parseInt(element.innerText, 10))).to.equal(1);
        expect(await page.$eval('#lastRowIndex', (element) => parseInt(element.innerText, 10))).to.equal(3);
        expect(await page.$eval('#totalRowsCount', (element) => parseInt(element.innerText, 10))).to.equal(3);
    });

    it('can set how many lhcPeriods is available per page', async () => {
        await goToPage(page, 'lhc-period-overview');
        await page.waitForTimeout(500);
        // Expect the amount selector to currently be set to 10 (because of the defined page height)
        const amountSelectorButton = await page.$('.dropup button');
        const amountSelectorButtonText = await amountSelectorButton.evaluate((element) => element.innerText);
        await page.waitForTimeout(300);
        expect(amountSelectorButtonText.trim().endsWith('11')).to.be.true;

        // Expect the dropdown options to be visible when it is selected
        await amountSelectorButton.evaluate((button) => button.click());
        await page.waitForTimeout(100);
        const amountSelectorDropdown = await page.$('.dropup');
        expect(Boolean(amountSelectorDropdown)).to.be.true;

        // Expect the amount of visible lhcfills to reduce when the first option (5) is selected
        const menuItem = await page.$('.dropup .menu-item');
        await menuItem.evaluate((button) => button.click());
        await page.waitForTimeout(100);

        const tableRows = await page.$$('table tr');
        expect(tableRows.length - 1).to.equal(3);

        // Expect the custom per page input to have red border and text color if wrong value typed
        const customPerPageInput = await page.$('.dropup input[type=number]');
        await customPerPageInput.evaluate((input) => input.focus());
        await page.$eval('.dropup input[type=number]', (el) => {
            el.value = '1111';
            el.dispatchEvent(new Event('input'));
        });
        await page.waitForTimeout(100);
        expect(Boolean(await page.$('.dropup input:invalid'))).to.be.true;
    });

    it('can sort by name column in ascending and descending manners', async () => {
        await goToPage(page, 'lhc-period-overview');
        // Expect a sorting preview to appear when hovering over a column header
        await page.hover('th#name');
        await page.waitForTimeout(100);
        const sortingPreviewIndicator = await page.$('#name-sort-preview');
        expect(Boolean(sortingPreviewIndicator)).to.be.true;

        // Sort by name in an ascending manner
        const nameHeader = await page.$('th#name');
        await nameHeader.evaluate((button) => button.click());
        await page.waitForTimeout(300);

        // Expect the names to be in alphabetical order
        const firstNames = await getAllDataFields(page, 'name');
        expect(firstNames).to.have.all.deep.ordered.members(firstNames.sort());
    });

    it('can sort by year column in ascending and descending manners', async () => {
        await goToPage(page, 'lhc-period-overview');
        // Expect a sorting preview to appear when hovering over a column header
        await page.hover('th#year');
        await page.waitForTimeout(100);
        const sortingPreviewIndicator = await page.$('#year-sort-preview');
        expect(Boolean(sortingPreviewIndicator)).to.be.true;

        // Sort by year in an ascending manner
        const yearHeader = await page.$('th#year');
        await yearHeader.evaluate((button) => button.click());
        await page.waitForTimeout(300);

        // Expect the year to be in order
        const firstYears = await getAllDataFields(page, 'year');
        expect(firstYears).to.have.all.deep.ordered.members(firstYears.sort());
    });

    it('can sort by avgCenterOfMassEnergy column in ascending and descending manners', async () => {
        await goToPage(page, 'lhc-period-overview');
        // Expect a sorting preview to appear when hovering over a column header
        await page.hover('th#avgCenterOfMassEnergy');
        await page.waitForTimeout(100);
        const sortingPreviewIndicator = await page.$('#avgCenterOfMassEnergy-sort-preview');
        expect(Boolean(sortingPreviewIndicator)).to.be.true;

        // Sort by avgCenterOfMassEnergy in an ascending manner
        const avgCeneterOfMassEnergyHeader = await page.$('th#avgCenterOfMassEnergy');
        await avgCeneterOfMassEnergyHeader.evaluate((button) => button.click());
        await page.waitForTimeout(300);

        // Expect the avgCenterOfMassEnergy to be in order
        const firstAvgCeneterOfMassEnergies = await getAllDataFields(page, 'avgCenterOfMassEnergy');
        expect(firstAvgCeneterOfMassEnergies).to.have.all.deep.ordered.members(firstAvgCeneterOfMassEnergies.sort());
    });

    it('should successfuly apply lhc period name filter', async () => {
        await goToPage(page, 'lhc-period-overview');
        await page.waitForTimeout(100);
        const filterToggleButton = await page.$('#openFilterToggle');
        expect(filterToggleButton).to.not.be.null;

        await filterToggleButton.evaluate((button) => button.click());
        await fillInput(page, 'div.flex-row.items-baseline:nth-of-type(2) input[type=text]', 'LHC22a');

        await page.waitForTimeout(100);

        let allLhcPeriodNameCellsContent = await getAllDataFields(page, 'name');
        expect(allLhcPeriodNameCellsContent).to.has.all.deep.members(['LHC22a']);

        const resetFiltersButton = await page.$('#reset-filters');
        expect(resetFiltersButton).to.not.be.null;
        await resetFiltersButton.evaluate((button) => button.click());
        await page.waitForTimeout(100);

        allLhcPeriodNameCellsContent = await getAllDataFields(page, 'name');
        expect(allLhcPeriodNameCellsContent).to.has.all.deep.members(['LHC22a', 'LHC22b', 'LHC23f']);
    });

    it('should successfuly apply lhc period year filter', async () => {
        await goToPage(page, 'lhc-period-overview');
        await page.waitForTimeout(100);
        const filterToggleButton = await page.$('#openFilterToggle');
        expect(filterToggleButton).to.not.be.null;

        await filterToggleButton.evaluate((button) => button.click());
        await fillInput(page, 'div.flex-row.items-baseline:nth-of-type(3) input[type=text]', '2022');

        await page.waitForTimeout(100);

        const allLhcPeriodYears = await getAllDataFields(page, 'year');
        expect([...new Set(allLhcPeriodYears)]).to.has.all.members(['2022']);
    });

    it('should successfuly apply lhc period beam type filter', async () => {
        await goToPage(page, 'lhc-period-overview');
        await page.waitForTimeout(100);
        const filterToggleButton = await page.$('#openFilterToggle');
        expect(filterToggleButton).to.not.be.null;

        await filterToggleButton.evaluate((button) => button.click());
        await fillInput(page, 'div.flex-row.items-baseline:nth-of-type(4) input[type=text]', 'XeXe');

        await page.waitForTimeout(100);

        const allLhcPeriodBeamTypes = await getAllDataFields(page, 'beamType');
        expect([...new Set(allLhcPeriodBeamTypes)]).to.has.all.members(['XeXe']);
    });
};
