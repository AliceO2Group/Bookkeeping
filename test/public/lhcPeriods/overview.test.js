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
    expectColumnValues,
    validateTableData,
    expectInnerText,
    waitForTableLength,
} = require('../defaults.js');
const { resetDatabaseContent } = require('../../utilities/resetDatabaseContent.js');

const { expect } = chai;

const periodNameRegex = /LHC\d\d[a-zA-Z]+/;

module.exports = () => {
    let page;
    let browser;

    before(async () => {
        [page, browser] = await defaultBefore(page, browser);
        await resetDatabaseContent();
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
        const allowedBeamTypesDisplays = new Set(['-', 'XeXe', 'PbPb', 'pp']);

        const tableDataValidators = {
            name: (name) => periodNameRegex.test(name),
            associatedRuns: (display) => /(No runs)|(\d+)/.test(display),
            associatedDataPasses: (display) => /(No data passes)|(\d+)/.test(display),
            associatedSimulationPasses: (display) => /(No MC)|(\d+)/.test(display),
            year: (year) => !isNaN(year),
            beamTypes: (beamTypes) => beamTypes.split(',').every((type) => allowedBeamTypesDisplays.has(type)),
            avgCenterOfMassEnergy: (avgCenterOfMassEnergy) => avgCenterOfMassEnergy === '-' || !isNaN(avgCenterOfMassEnergy),
            distinctEnergies: (distinctEnergies) => distinctEnergies === '-'
                || distinctEnergies
                    .split(',')
                    .every((energy) => !isNaN(energy)),
        };

        await validateTableData(page, new Map(Object.entries(tableDataValidators)));
    });

    it('Should display the correct items counter at the bottom of the page', async () => {
        await goToPage(page, 'lhc-period-overview');

        await expectInnerText(page, '#firstRowIndex', '1');
        await expectInnerText(page, '#lastRowIndex', '3');
        await expectInnerText(page, '#totalRowsCount', '3');
    });

    it('can set how many lhcPeriods is available per page', async () => {
        await goToPage(page, 'lhc-period-overview');

        // Expect the amount selector to currently be set to 11 (because of the defined page height)
        await expectInnerText(page, '.dropup button', 'Rows per page: 11 ');

        // Expect the dropdown options to be visible when it is selected
        await pressElement(page, '.dropup button');
        await page.waitForSelector('.dropup-menu');
        const amountSelectorDropdown = await page.$('.dropup');
        expect(Boolean(amountSelectorDropdown)).to.be.true;

        // Expect the amount selector to currently be set to 5 when the first option (5) is selected
        await pressElement(page, '.dropup .menu-item');
        await expectInnerText(page, '.dropup button', 'Rows per page: 5 ');
        await waitForTableLength(page, 3);

        // Expect the custom per page input to have red border and text color if wrong value typed
        const customPerPageInput = await page.$('.dropup input[type=number]');
        await customPerPageInput.evaluate((input) => input.focus());
        await page.$eval('.dropup input[type=number]', (el) => {
            el.value = '1111';
            el.dispatchEvent(new Event('input'));
        });
        await page.waitForSelector('.dropup input:invalid');
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

    it('should successfully apply lhc period name filter', async () => {
        await goToPage(page, 'lhc-period-overview');
        await pressElement(page, '#openFilterToggle');
        await page.waitForSelector('#reset-filters:disabled');
        await fillInput(page, 'div.flex-row.items-baseline:nth-of-type(1) input[type=text]', 'LHC22a');
        await expectColumnValues(page, 'name', ['LHC22a']);
        await pressElement(page, '#reset-filters', true);
        await expectColumnValues(page, 'name', ['LHC23f', 'LHC22b', 'LHC22a']);
        await page.waitForSelector('#reset-filters:disabled');
    });

    it('should successfully apply lhc period year filter', async () => {
        await goToPage(page, 'lhc-period-overview');
        await pressElement(page, '#openFilterToggle');
        await page.waitForSelector('#reset-filters:disabled');
        await fillInput(page, 'div.flex-row.items-baseline:nth-of-type(2) input[type=text]', '2022');
        await page.waitForSelector('#reset-filters:disabled', { hidden: true, timeout: 250 });
        await expectColumnValues(page, 'year', ['2022', '2022']);
    });

    it('should successfully apply lhc period beam type filter', async () => {
        await goToPage(page, 'lhc-period-overview');
        await pressElement(page, '#openFilterToggle');
        await page.waitForSelector('#reset-filters:disabled');
        await fillInput(page, 'div.flex-row.items-baseline:nth-of-type(3) input[type=text]', 'PbPb');
        await page.waitForSelector('#reset-filters:disabled', { hidden: true, timeout: 250 });
        await expectColumnValues(page, 'beamTypes', ['PbPb']);
    });
};
