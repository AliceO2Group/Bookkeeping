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
        const response = await goToPage(page, 'data-passes-per-simulation-pass-overview', { queryParameters: { simulationPassId: 1 } });

        // We expect the page to return the correct status code, making sure the server is running properly
        expect(response.status()).to.equal(200);

        // We expect the page to return the correct title, making sure there isn't another server running on this port
        const title = await page.title();
        expect(title).to.equal('AliceO2 Bookkeeping');

        const headerBreadcrumbs = await page.$$('h2');
        expect(await headerBreadcrumbs[0].evaluate((element) => element.innerText)).to.be.equal('Data Passes per MC');
        expect(await headerBreadcrumbs[1].evaluate((element) => element.innerText)).to.be.equal('LHC23k6c');
    });

    it('shows correct datatypes in respective columns', async () => {
        const dataSizeUnits = new Set(['B', 'KB', 'MB', 'GB', 'TB']);
        const tableDataValidators = {
            name: (name) => periodNameRegex.test(name),
            associatedRuns: (display) => /(No runs)|(\d+\nRuns)/.test(display),
            anchoredSimulationPasses: (display) => /(No MC)|(\d+\nAnchored)/.test(display),
            description: (description) => /(-)|(.+)/.test(description),
            reconstructedEventsCount: (reconstructedEventsCount) => !isNaN(reconstructedEventsCount.replace(/,/g, ''))
                || reconstructedEventsCount === '-',
            outputSize: (outpuSize) => {
                const [number, unit] = outpuSize.split(' ');
                return !isNaN(number) && dataSizeUnits.has(unit.trim());
            },
        };

        await validateTableData(page, new Map(Object.entries(tableDataValidators)));
    });

    it('Should display the correct items counter at the bottom of the page', async () => {
        await goToPage(page, 'data-passes-per-simulation-pass-overview', { queryParameters: { simulationPassId: 1 } });

        await expectInnerText(page, '#firstRowIndex', '1');
        await expectInnerText(page, '#lastRowIndex', '2');
        await expectInnerText(page, '#totalRowsCount', '2');
    });

    it('can set how many data passes is available per page', async () => {
        await goToPage(page, 'data-passes-per-simulation-pass-overview', { queryParameters: { simulationPassId: 1 } });

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

        // Expect the custom per page input to have red border and text color if wrong value typed
        const customPerPageInput = await page.$('.dropup input[type=number]');
        await customPerPageInput.evaluate((input) => input.focus());
        await page.$eval('.dropup input[type=number]', (el) => {
            el.value = '1111';
            el.dispatchEvent(new Event('input'));
        });

        await page.waitForSelector('.dropup');
        expect(Boolean(await page.$('.dropup input:invalid'))).to.be.true;
    });

    it('can sort by name column in ascending and descending manners', async () => {
        await goToPage(page, 'data-passes-per-simulation-pass-overview', { queryParameters: { simulationPassId: 1 } });
        await testTableSortingByColumn(page, 'name');
    });

    it('can sort by ReconstructedEvents column in ascending and descending manners', async () => {
        await goToPage(page, 'data-passes-per-simulation-pass-overview', { queryParameters: { simulationPassId: 1 } });
        await testTableSortingByColumn(page, 'reconstructedEventsCount');
    });

    it('can sort by outputSize column in ascending and descending manners', async () => {
        await goToPage(page, 'data-passes-per-simulation-pass-overview', { queryParameters: { simulationPassId: 1 } });
        await testTableSortingByColumn(page, 'outputSize');
    });

    it('should successfuly apply data pass name filter', async () => {
        await goToPage(page, 'data-passes-per-simulation-pass-overview', { queryParameters: { simulationPassId: 1 } });
        await pressElement(page, '#openFilterToggle');

        await fillInput(page, 'div.flex-row.items-baseline:nth-of-type(2) input[type=text]', 'LHC22b_apass1');
        await expectColumnValues(page, 'name', ['LHC22b_apass1']);

        await pressElement(page, '#reset-filters');
        await expectColumnValues(page, 'name', ['LHC22b_apass2', 'LHC22b_apass1']);
    });
};
