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
        const dataSizeUnits = new Set(['B', 'KB', 'MB', 'GB', 'TB']);
        const headerDatatypes = {
            name: (name) => periodNameRegex.test(name),
            associatedRuns: (display) => /(No runs)|(\d+)/.test(display),
            associatedDataPasses: (display) => /(No anchorage)|(\d+)/.test(display),
            pwg: (pwg) => /PWG.+/.test(pwg),
            jiraId: (jiraId) => /[A-Z]+[A-Z0-9]+-\d+/.test(jiraId),
            requestedEventsCount: (requestedEventsCount) => !isNaN(requestedEventsCount.replace(/,/g, '')),
            generatedEventsCount: (generatedEventsCount) => !isNaN(generatedEventsCount.replace(/,/g, '')),
            outputSize: (outpuSize) => {
                const [number, unit] = outpuSize.split(' ');
                return !isNaN(number) && dataSizeUnits.has(unit.trim());
            },
        };

        await validateTableData(page, new Map(Object.entries(headerDatatypes)));
    });

    it('Should display the correct items counter at the bottom of the page', async () => {
        await goToPage(page, 'simulation-passes-per-lhc-period-overview', { queryParameters: { lhcPeriodId: 1 } });

        await expectInnerText(page, '#firstRowIndex', '1');
        await expectInnerText(page, '#lastRowIndex', '2');
        await expectInnerText(page, '#totalRowsCount', '2');
    });

    it('can set how many simulation passes is available per page', async () => {
        await goToPage(page, 'simulation-passes-per-lhc-period-overview', { queryParameters: { lhcPeriodId: 1 } });

        // Expect the amount selector to currently be set to 10 (because of the defined page height)
        await expectInnerText(page, '.dropup button', 'Rows per page: 9 ');

        // Expect the dropdown options to be visible when it is selected
        await pressElement(page, '.dropup button');
        await page.waitForSelector('.dropup-menu');

        // Expect the amount of visible simulationPasses to reduce when the first option (5) is selected
        await pressElement(page, '.dropup .menu-item');

        // Expect the custom per page input to have red border and text color if wrong value typed
        const customPerPageInput = await page.$('.dropup input[type=number]');
        await customPerPageInput.evaluate((input) => input.focus());

        await page.$eval('.dropup input[type=number]', (element) => {
            element.value = '1111';
            element.dispatchEvent(new Event('input'));
        });
        await page.waitForSelector('.dropup input:invalid');
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

        await fillInput(page, 'div.flex-row.items-baseline:nth-of-type(1) input[type=text]', 'LHC23k6a');
        await expectColumnValues(page, 'name', ['LHC23k6a']);

        await fillInput(page, 'div.flex-row.items-baseline:nth-of-type(1) input[type=text]', 'LHC23k6a, LHC23k6b');
        await expectColumnValues(page, 'name', ['LHC23k6b', 'LHC23k6a']);
    });
};
