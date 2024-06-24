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
    waitForTableLength,
    validateTableData,
    waitForNavigation,
    pressElement,
    getTableDataSlice,
    expectColumnValues,
    expectUrlParams,
    expectInnerText,
    testTableSortingByColumn,
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
        const response = await goToPage(page, 'data-passes-per-lhc-period-overview', { queryParameters: { lhcPeriodId: 2 } });

        // We expect the page to return the correct status code, making sure the server is running properly
        expect(response.status()).to.equal(200);

        // We expect the page to return the correct title, making sure there isn't another server running on this port
        const title = await page.title();
        expect(title).to.equal('AliceO2 Bookkeeping');
    });

    it('shows correct datatypes in respective columns', async () => {
        await goToPage(page, 'data-passes-per-lhc-period-overview', { queryParameters: { lhcPeriodId: 2 } });

        const dataSizeUnits = new Set(['B', 'KB', 'MB', 'GB', 'TB']);
        const tableDataValidators = {
            name: (name) => periodNameRegex.test(name),
            associatedRuns: (display) => /(No runs)|(\d+)/.test(display),
            anchoredSimulationPasses: (display) => /(No MC)|(\d+)/.test(display),
            description: (description) => /(-)|(.+)/.test(description),
            reconstructedEventsCount: (reconstructedEventsCount) => !isNaN(reconstructedEventsCount.replace(/,/g, ''))
                || reconstructedEventsCount === '-',
            outputSize: (outpuSize) => {
                const [number, unit] = outpuSize.split(' ');
                return !isNaN(number) && dataSizeUnits.has(unit.trim());
            },
        };

        await validateTableData(page, new Map(Object.entries(tableDataValidators)));

        const tableSlice = await getTableDataSlice(page, ['name', 'associatedRuns', 'anchoredSimulationPasses']);
        expect(tableSlice.map(({ name, associatedRuns, anchoredSimulationPasses }) => ({
            name,
            runsCount: Number(associatedRuns.split('\n')[0]),
            simulationPassesCount: Number(anchoredSimulationPasses.split('\n')[0]) || 0,
        }))).to.have.all.deep.members([
            {
                name: 'LHC22b_apass2',
                runsCount: 3,
                simulationPassesCount: 1,
            },
            {
                name: 'LHC22b_apass1',
                runsCount: 3,
                simulationPassesCount: 1,
            },
        ]);
    });

    it('can navigate to runs per data pass page', async () => {
        await goToPage(page, 'data-passes-per-lhc-period-overview', { queryParameters: { lhcPeriodId: 2 } });
        await waitForNavigation(page, () => pressElement(page, 'tbody tr td:nth-of-type(2) a'));
        expectUrlParams(page, {
            page: 'runs-per-data-pass',
            dataPassId: '2',
        });
    });

    it('can navigate to anchored simulation passes per data pass page', async () => {
        await goToPage(page, 'data-passes-per-lhc-period-overview', { queryParameters: { lhcPeriodId: 2 } });
        await waitForNavigation(page, () => pressElement(page, 'tbody tr td:nth-of-type(3) a'));
        expectUrlParams(page, {
            page: 'anchored-simulation-passes-overview',
            dataPassId: '2',
        });
    });

    it('Should display the correct items counter at the bottom of the page', async () => {
        await goToPage(page, 'data-passes-per-lhc-period-overview', { queryParameters: { lhcPeriodId: 2 } });

        await expectInnerText(page, '#firstRowIndex', '1');
        await expectInnerText(page, '#lastRowIndex', '2');
        await expectInnerText(page, '#totalRowsCount', '2');
    });

    it('can set how many data passes is available per page', async () => {
        await goToPage(page, 'data-passes-per-lhc-period-overview', { queryParameters: { lhcPeriodId: 2 } });

        // Expect the amount selector to currently be set to 9 (because of the defined page height)
        await expectInnerText(page, '.dropup button', 'Rows per page: 9 ');

        // Expect the dropdown options to be visible when it is selected
        await pressElement(page, '.dropup button');
        await page.waitForSelector('.dropup-menu');

        // Expect the amount of visible lhcfills to reduce when the first option (5) is selected
        pressElement(page, '.dropup .menu-item');

        await waitForTableLength(page, 2);

        // Expect the custom per page input to have red border and text color if wrong value typed
        await page.$eval('.dropup input[type=number]', (el) => {
            el.value = '1111';
            el.dispatchEvent(new Event('input'));
        });
        await page.waitForSelector('.dropup input:invalid');
    });

    it('can sort by name column in ascending and descending manners', async () => {
        await goToPage(page, 'data-passes-per-lhc-period-overview', { queryParameters: { lhcPeriodId: 2 } });
        // Expect a sorting preview to appear when hovering over a column header
        await page.waitForSelector('th#name');
        await page.hover('th#name');
        await page.waitForSelector('#name-sort-preview');

        await testTableSortingByColumn(page, 'name');
    });

    it('should successfuly apply data pass name filter', async () => {
        await pressElement(page, '#openFilterToggle');
        await fillInput(page, 'div.flex-row.items-baseline:nth-of-type(1) input[type=text]', 'LHC22b_apass1');

        await expectColumnValues(page, 'name', ['LHC22b_apass1']);

        await pressElement(page, '#reset-filters', true);
        await expectColumnValues(page, 'name', ['LHC22b_apass2', 'LHC22b_apass1']);
    });
};
