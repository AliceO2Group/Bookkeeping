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
    pressElement,
    waitForTableDataReload,
    testTableSortingByColumn,
} = require('../defaults');
const { waitForTimeout } = require('../defaults.js');

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

    const ALLOWED_BEAM_TYPE_DISPLAYS = new Set(['-', 'XeXe', 'PbPb', 'pp']);

    it('loads the page successfully', async () => {
        const response = await goToPage(page, 'lhc-period-overview');

        // We expect the page to return the correct status code, making sure the server is running properly
        expect(response.status()).to.equal(200);

        // We expect the page to return the correct title, making sure there isn't another server running on this port
        const title = await page.title();
        expect(title).to.equal('AliceO2 Bookkeeping');
    });

    it('shows correct datatypes in respective columns', async () => {
        // Expectations of header texts being of a certain datatype
        const headerDatatypes = {
            name: (name) => periodNameRegex.test(name),
            associatedRuns: (display) => /(No runs)|(\d+\nRuns)/.test(display),
            associatedDataPasses: (display) => /(No data passes)|(\d+\nData Passes)/.test(display),
            associatedSimulationPasses: (display) => /(No MC)|(\d+\nMC)/.test(display),
            year: (year) => !isNaN(year),
            beamTypes: (beamTypes) => beamTypes.split(',').every((type) => ALLOWED_BEAM_TYPE_DISPLAYS.has(type)),
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
                expect(expectedDatatype, `${headerIndices[index]} <${cellContent}> incorrect datatype`).to.be.true;
            }
        }
    });

    it('Should display the correct items counter at the bottom of the page', async () => {
        await goToPage(page, 'lhc-period-overview');
        await waitForTimeout(100);

        expect(await page.$eval('#firstRowIndex', (element) => parseInt(element.innerText, 10))).to.equal(1);
        expect(await page.$eval('#lastRowIndex', (element) => parseInt(element.innerText, 10))).to.equal(3);
        expect(await page.$eval('#totalRowsCount', (element) => parseInt(element.innerText, 10))).to.equal(3);
    });

    it('can set how many lhcPeriods is available per page', async () => {
        await goToPage(page, 'lhc-period-overview');
        await waitForTimeout(500);
        // Expect the amount selector to currently be set to 10 (because of the defined page height)
        const amountSelectorButton = await page.$('.dropup button');
        const amountSelectorButtonText = await amountSelectorButton.evaluate((element) => element.innerText);
        await waitForTimeout(300);
        expect(amountSelectorButtonText.trim().endsWith('11')).to.be.true;

        // Expect the dropdown options to be visible when it is selected
        await amountSelectorButton.evaluate((button) => button.click());
        await waitForTimeout(100);
        const amountSelectorDropdown = await page.$('.dropup');
        expect(Boolean(amountSelectorDropdown)).to.be.true;

        // Expect the amount of visible lhcfills to reduce when the first option (5) is selected
        const menuItem = await page.$('.dropup .menu-item');
        await menuItem.evaluate((button) => button.click());
        await waitForTimeout(100);

        const tableRows = await page.$$('table tr');
        expect(tableRows.length - 1).to.equal(3);

        // Expect the custom per page input to have red border and text color if wrong value typed
        const customPerPageInput = await page.$('.dropup input[type=number]');
        await customPerPageInput.evaluate((input) => input.focus());
        await page.$eval('.dropup input[type=number]', (el) => {
            el.value = '1111';
            el.dispatchEvent(new Event('input'));
        });
        await waitForTimeout(100);
        expect(Boolean(await page.$('.dropup input:invalid'))).to.be.true;
    });

    it('can sort by name column in ascending and descending manners', async () => {
        await goToPage(page, 'lhc-period-overview');
        await testTableSortingByColumn(page, 'name');
    });

    it('can sort by year column in ascending and descending manners', async () => {
        await goToPage(page, 'lhc-period-overview');
        await testTableSortingByColumn(page, 'year');
    });

    it('can sort by avgCenterOfMassEnergy column in ascending and descending manners', async () => {
        await goToPage(page, 'lhc-period-overview');
        await testTableSortingByColumn(page, 'avgCenterOfMassEnergy');
    });

    it('should successfuly apply lhc period name filter', async () => {
        await goToPage(page, 'lhc-period-overview');
        await pressElement(page, '#openFilterToggle');
        await waitForTableDataReload(page, () => fillInput(page, '.name-filter input[type=text]', 'LHC22a'));
        let allLhcPeriodNameCellsContent = await getAllDataFields(page, 'name');
        expect(allLhcPeriodNameCellsContent).to.has.all.deep.members(['LHC22a']);

        await waitForTableDataReload(page, () => pressElement(page, '#reset-filters'));
        allLhcPeriodNameCellsContent = await getAllDataFields(page, 'name');
        expect(allLhcPeriodNameCellsContent).to.has.all.deep.members(['LHC22a', 'LHC22b', 'LHC23f']);
    });

    it('should successfuly apply lhc period year filter', async () => {
        await goToPage(page, 'lhc-period-overview');
        await pressElement(page, '#openFilterToggle');

        await waitForTableDataReload(page, () => fillInput(page, '.year-filter input[type=text]', '2022'));
        let allLhcPeriodYears = await getAllDataFields(page, 'year');
        expect([...new Set(allLhcPeriodYears)]).to.has.all.members(['2022']);

        await waitForTableDataReload(page, () => fillInput(page, '.year-filter input[type=text]', '2023'));
        allLhcPeriodYears = await getAllDataFields(page, 'year');
        expect([...new Set(allLhcPeriodYears)]).to.has.all.members(['2023']);

        await waitForTableDataReload(page, () => pressElement(page, '#reset-filters'));
        allLhcPeriodYears = await getAllDataFields(page, 'year');
        expect(allLhcPeriodYears).to.be.lengthOf.greaterThan(0);
    });

    it('should successfuly apply lhc period beam type filter', async () => {
        await goToPage(page, 'lhc-period-overview');
        await pressElement(page, '#openFilterToggle');

        await waitForTableDataReload(page, () => fillInput(page, '.beamTypes-filter input[type=text]', 'XeXe'));
        let allLhcPeriodBeamTypes = await getAllDataFields(page, 'beamTypes');
        expect([...new Set(allLhcPeriodBeamTypes)]).to.has.all.members(['XeXe']);

        await waitForTableDataReload(page, () => pressElement(page, '#reset-filters'));
        allLhcPeriodBeamTypes = await getAllDataFields(page, 'beamTypes');
        expect([...new Set(allLhcPeriodBeamTypes)].flatMap((beamType) => beamType.split(','))).to.has
            .all.members([...ALLOWED_BEAM_TYPE_DISPLAYS]);
    });
};
