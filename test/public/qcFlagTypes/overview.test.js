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
    testTableAscendingSortingByColumn,
    waitForTableDataReload,
    fillInput,
    getAllDataFields,
} = require('../defaults');

const { expect } = chai;

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
        const response = await goToPage(page, 'qc-flag-types');

        // We expect the page to return the correct status code, making sure the server is running properly
        expect(response.status()).to.equal(200);

        // We expect the page to return the correct title, making sure there isn't another server running on this port
        const title = await page.title();
        expect(title).to.equal('AliceO2 Bookkeeping');
        const header = await page.$('h2');
        expect(await header.evaluate((element) => element.innerText)).to.be.equal('QC Flag Types');
    });

    it('Should display the correct items counter at the bottom of the page', async () => {
        await goToPage(page, 'qc-flag-types');
        await page.waitForSelector('#firstRowIndex');

        expect(await page.$eval('#firstRowIndex', (element) => parseInt(element.innerText, 10))).to.equal(1);
        expect(await page.$eval('#lastRowIndex', (element) => parseInt(element.innerText, 10))).to.equal(5);
        expect(await page.$eval('#totalRowsCount', (element) => parseInt(element.innerText, 10))).to.equal(5);
    });

    it('can sort by name column in ascending manner', async () => {
        await goToPage(page, 'qc-flag-types');
        await testTableAscendingSortingByColumn(page, 'name');
    });

    it('can sort by method column in ascending manner', async () => {
        await goToPage(page, 'qc-flag-types');
        await testTableAscendingSortingByColumn(page, 'method');
    });

    it('can sort by bad column in ascending manner', async () => {
        await goToPage(page, 'qc-flag-types');
        await testTableAscendingSortingByColumn(page, 'bad');
    });

    it('should successfuly apply QC flag type names filter', async () => {
        await goToPage(page, 'qc-flag-types');
        await page.waitForSelector('#openFilterToggle');
        const filterToggleButton = await page.$('#openFilterToggle');
        expect(filterToggleButton).to.not.be.null;

        await filterToggleButton.evaluate((button) => button.click());

        await waitForTableDataReload(page, () => fillInput(page, '.name-filter input[type=text]', 'bad'));

        const allQCFlagTypeNames = await getAllDataFields(page, 'name');
        expect(allQCFlagTypeNames.every((name) => /[Bb][Aa][Dd]/.test(name)), allQCFlagTypeNames).to.be.true;
    });

    it('should successfuly apply QC flag type method filter', async () => {
        await goToPage(page, 'qc-flag-types');
        await page.waitForSelector('#openFilterToggle');
        const filterToggleButton = await page.$('#openFilterToggle');
        expect(filterToggleButton).to.not.be.null;

        await filterToggleButton.evaluate((button) => button.click());

        await waitForTableDataReload(page, () => fillInput(page, '.method-filter input[type=text]', 'bad'));

        const allQCFlagTypeNames = await getAllDataFields(page, 'method');
        expect(allQCFlagTypeNames.every((name) => /[Bb][Aa][Dd]/.test(name)), allQCFlagTypeNames).to.be.true;
    });

    it('should successfuly apply QC flag type bad filter', async () => {
        await goToPage(page, 'qc-flag-types');
        await page.waitForSelector('#openFilterToggle');
        const filterToggleButton = await page.$('#openFilterToggle');
        expect(filterToggleButton).to.not.be.null;

        await filterToggleButton.evaluate((button) => button.click());

        await waitForTableDataReload(page, () =>
            page.$('.bad-filter input[type=checkbox]')
                .then((element) => element.evaluate((checkbox) => checkbox.click())));

        const allQCFlagTypeNames = await getAllDataFields(page, 'bad');
        expect(allQCFlagTypeNames.every((bad) => bad === 'Yes'), allQCFlagTypeNames).to.be.true;
    });
};
