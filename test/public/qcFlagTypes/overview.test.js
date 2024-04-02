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
    pressElement,
    expectInnerText,
    testTableSortingByColumn,
    validateTableData,
    checkColumnValuesWithRegex,
} = require('../defaults');

const { expect } = chai;

const dateAndTime = require('date-and-time');

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
        const response = await goToPage(page, 'qc-flag-types-overview');

        // We expect the page to return the correct status code, making sure the server is running properly
        expect(response.status()).to.equal(200);

        // We expect the page to return the correct title, making sure there isn't another server running on this port
        const title = await page.title();
        expect(title).to.equal('AliceO2 Bookkeeping');
        await expectInnerText(page, 'h2', 'QC Flag Types');
    });

    it('shows correct datatypes in respective columns', async () => {
        await goToPage(page, 'qc-flag-types-overview');

        const tableDataValidators = {
            name: (name) => name !== '-',
            method: (method) => method !== '-',
            bad: (isBad) => isBad === 'Yes' || isBad === 'No',
            createdAt: (date) => !isNaN(dateAndTime.parse(date, 'DD/MM/YYYY, hh:mm:ss')),
            updatedAt: (date) => date === '-' | !isNaN(dateAndTime.parse(date, 'DD/MM/YYYY, hh:mm:ss')),
            createdBy: (userName) => userName !== '-',
        };

        await validateTableData(page, new Map(Object.entries(tableDataValidators)));
    });

    it('Should display the correct items counter at the bottom of the page', async () => {
        await goToPage(page, 'qc-flag-types-overview');

        await expectInnerText(page, '#firstRowIndex', '1');
        await expectInnerText(page, '#lastRowIndex', '6');
        await expectInnerText(page, '#totalRowsCount', '6');
    });

    it('can sort by name column in ascending manner', async () => {
        await goToPage(page, 'qc-flag-types-overview');
        await testTableSortingByColumn(page, 'name');
    });

    it('can sort by method column in ascending manner', async () => {
        await goToPage(page, 'qc-flag-types-overview');
        await testTableSortingByColumn(page, 'method');
    });

    it('can sort by bad column in ascending manner', async () => {
        await goToPage(page, 'qc-flag-types-overview');
        await testTableSortingByColumn(page, 'bad');
    });

    it('should successfuly apply QC flag type names filter', async () => {
        await goToPage(page, 'qc-flag-types-overview');
        await pressElement(page, '#openFilterToggle');
        await fillInput(page, '.name-filter input[type=text]', 'bad');
        await checkColumnValuesWithRegex(page, 'name', '[Bb][Aa][Dd]');
    });

    it('should successfuly apply QC flag type method filter', async () => {
        await goToPage(page, 'qc-flag-types-overview');
        await pressElement(page, '#openFilterToggle');
        await fillInput(page, '.method-filter input[type=text]', 'bad');
        await checkColumnValuesWithRegex(page, 'method', '[Bb][Aa][Dd]');
    });

    it('should successfuly apply QC flag type bad filter', async () => {
        await goToPage(page, 'qc-flag-types-overview');
        await pressElement(page, '#openFilterToggle');
        await pressElement(page, '.bad-filter input[type=checkbox]');
        await checkColumnValuesWithRegex(page, 'bad', '^Yes$');
    });
};
