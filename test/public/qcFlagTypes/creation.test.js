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
    waitForNavigation,
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

    it('loads page - QC Flag Types overview successfully', async () => {
        const response = await goToPage(page, 'qc-flag-type-creation');

        // We expect the page to return the correct status code, making sure the server is running properly
        expect(response.status()).to.equal(200);

        // We expect the page to return the correct title, making sure there isn't another server running on this port
        const title = await page.title();
        expect(title).to.equal('AliceO2 Bookkeeping');
        const header = await page.$('h2');
        expect(await header.evaluate((element) => element.innerText)).to.be.equal('QC Flag Type Creation');
    });

    it('should fail if attempt to create QC Flag Type with already existing name', async () => {
        await goToPage(page, 'qc-flag-type-creation');
        await page.waitForSelector('button#submit[disabled]');

        await fillInput(page, 'input#name', 'LimitedAcceptance');
        await fillInput(page, 'input#method', 'Limited acceptance');
        await pressElement('button#submit');
        await page.waitForSelector('.alert.alert-danger');
        await expectInnerText(page, '.alert', 'Service unavailable: Validation error');
    });

    it('should succesfully create QC Flag Type', async () => {
        await goToPage(page, 'qc-flag-type-creation');
        await page.waitForSelector('button#submit[disabled]');

        await fillInput(page, 'input#name', 'AAA+');
        await fillInput(page, 'input#method', 'A+A+A');
        await fillInput(page, 'input[type=color]', '#F000F0');
        await page.waitForSelector('button#submit[disabled]', { hidden: true });

        await waitForNavigation(page, () => pressElement('button#submit'));
        const currentPageUrl = new URL(page.url());
        expect(currentPageUrl.searchParams.get('page')).to.be.equal('qc-flag-types-overview');

        const newNameCell = await page.waitForSelector('[style*="rbg(240, 0, 240)"]');
        expect(newNameCell).not.to.be.null;
        expect(await newNameCell.evaluate(({ innerText }) => innerText)).to.be.equal('AAA+');
    });
};
