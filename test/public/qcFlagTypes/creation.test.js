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
    validateElement,
    checkMismatchingUrlParam,
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
        expect(response.status()).to.equal(200);

        const title = await page.title();
        expect(title).to.equal('AliceO2 Bookkeeping');
        await expectInnerText(page, 'h2', 'QC Flag Type Creation');
    });

    it('should fail if attempt to create QC Flag Type with already existing name', async () => {
        await goToPage(page, 'qc-flag-type-creation');
        await validateElement(page, 'button#submit[disabled]');

        await fillInput(page, 'input#id', '1001');
        await fillInput(page, 'input#name', 'LimitedAcceptance');
        await fillInput(page, 'input#method', 'Limited acceptance');
        await pressElement(page, 'button#submit');
        await expectInnerText(
            page,
            '.alert.alert-danger',
            // eslint-disable-next-line max-len
            'The request conflicts with existing data: A QC flag type with id 1001 or name LimitedAcceptance or method Limited acceptance already exists',
        );
    });

    it('should succesfully create QC Flag Type', async () => {
        await goToPage(page, 'qc-flag-type-creation');
        await validateElement(page, 'button#submit[disabled]');

        await fillInput(page, 'input#id', '1001');
        await fillInput(page, 'input#name', 'AAA+');
        await fillInput(page, 'input#method', 'A+A+A');
        await fillInput(page, 'input[type=color]', '#F000F0');

        await page.waitForSelector('button#submit[disabled]', { hidden: true, timeout: 250 });

        await waitForNavigation(page, () => pressElement(page, 'button#submit'));
        expect(await checkMismatchingUrlParam(page, { page: 'qc-flag-types-overview' })).to.be.eql({});

        // Expect newly created flag to appear and have correct color
        await expectInnerText(page, '[style*="rgb(240, 0, 240)"]', 'AAA+');
    });
};
