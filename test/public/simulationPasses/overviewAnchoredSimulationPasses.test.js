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
    getColumnCellsInnerTexts,
    fillInput,
    waitForTableDataReload,
    validateTableData,
    pressElement,
    testTableSortingByColumn,
    expectInnerText,
    expectInnerTextTo,
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
        expect(response.status()).to.equal(200);
        const title = await page.title();
        expect(title).to.equal('AliceO2 Bookkeeping');

        await expectInnerText(page, 'h2:nth-of-type(1)', 'Anchored MC');
        await expectInnerText(page, 'h2:nth-of-type(2)', 'LHC22a_apass1');
    });

    it('shows correct datatypes in respective columns', async () => {
        await goToPage(page, 'anchored-simulation-passes-overview', { queryParameters: { dataPassId: 3 } });

        const dataSizeUnits = new Set(['B', 'KB', 'MB', 'GB', 'TB']);
        const tableDataValidators = {
            name: (name) => periodNameRegex.test(name),
            jiraId: (jiraId) => /[A-Z][A-Z0-9]+-[0-9]+/.test(jiraId),
            pwg: (pwg) => /PWG.+/.test(pwg),
            requestedEventsCount: (requestedEventsCount) => !isNaN(requestedEventsCount.replace(/,/g, '')),
            generatedEventsCount: (generatedEventsCount) => !isNaN(generatedEventsCount.replace(/,/g, '')),
            outputSize: (outpuSize) => {
                const [number, unit] = outpuSize.split(' ');
                return !isNaN(number) && dataSizeUnits.has(unit.trim());
            },
        };

        await validateTableData(page, new Map(Object.entries(tableDataValidators)));
    });

    it('Should display the correct items counter at the bottom of the page', async () => {
        await goToPage(page, 'anchored-simulation-passes-overview', { queryParameters: { dataPassId: 3 } });
        await expectInnerText(page, '#firstRowIndex', '1');
        await expectInnerText(page, '#lastRowIndex', '2');
        await expectInnerText(page, '#totalRowsCount', '2');
    });

    it('can set how many simulation passes is available per page', async () => {
        await goToPage(page, 'anchored-simulation-passes-overview', { queryParameters: { dataPassId: 3 } });

        await expectInnerTextTo(page, '.dropup button', (text) => text.trim().endsWith('9'));
        await pressElement(page, '.dropup button');
        await pressElement(page, '.dropup .menu-item');

        // Expect the custom per page input to have red border and text color if wrong value typed
        await fillInput(page, '.dropup input[type=number]', '1111');
        await page.waitForSelector('.dropup input:invalid', { timeout: 250 });
    });

    it('can sort by name column in ascending and descending manners', async () => {
        await goToPage(page, 'anchored-simulation-passes-overview', { queryParameters: { dataPassId: 3 } });
        testTableSortingByColumn(page, 'name');
    });

    it('can sort by requestedEventsCount column in ascending and descending manners', async () => {
        await goToPage(page, 'anchored-simulation-passes-overview', { queryParameters: { dataPassId: 3 } });
        testTableSortingByColumn(page, 'requestedEventsCount');
    });

    it('can sort by generatedEventsCount column in ascending and descending manners', async () => {
        await goToPage(page, 'anchored-simulation-passes-overview', { queryParameters: { dataPassId: 3 } });
        testTableSortingByColumn(page, 'generatedEventsCount');
    });

    it('can sort by outputSize column in ascending and descending manners', async () => {
        await goToPage(page, 'anchored-simulation-passes-overview', { queryParameters: { dataPassId: 3 } });
        testTableSortingByColumn(page, 'outputSize');
    });

    it('should successfuly apply simulation passes name filter', async () => {
        await goToPage(page, 'anchored-simulation-passes-overview', { queryParameters: { dataPassId: 3 } });
        await pressElement(page, '#openFilterToggle');
        await waitForTableDataReload(page, () => fillInput(page, '.name-filter input[type=text]', 'LHC23k6a'));

        let allDataPassesNames = await getColumnCellsInnerTexts(page, 'name');
        expect(allDataPassesNames).to.has.all.deep.members(['LHC23k6a']);

        await waitForTableDataReload(page, () => fillInput(page, '.name-filter input[type=text]', 'LHC23k6a, LHC23k6b'));

        allDataPassesNames = await getColumnCellsInnerTexts(page, 'name');
        expect(allDataPassesNames).to.has.all.deep.members(['LHC23k6a', 'LHC23k6b']);
    });
};
