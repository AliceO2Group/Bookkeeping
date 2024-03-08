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
    validateDetiailsList,
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
        const response = await goToPage(page, 'qc-flag-type-details', { queryParameters: { id: 11 } });
        expect(response.status()).to.equal(200);

        const title = await page.title();
        expect(title).to.equal('AliceO2 Bookkeeping');
        await expectInnerText(page, 'h2', 'QC Flag Type: LimitedAcceptance');
    });

    it('should dispay correct data', async () => {
        await goToPage(page, 'qc-flag-type-details', { queryParameters: { id: 11 } });
        const detailsContentValidators = [
            ['ID', '11'],
            ['Name', 'LimitedAcceptance'],
            ['Method', 'Limited acceptance'],
            ['Bad', 'Yes'],
            ['Last modified', '-'],
            ['Last modified by', '-'],
            ['Created at', (d) => String(new Date(d)) !== 'Invalid Date'],
            ['Created by', 'Anonymous'],
            ['Archived', 'No'],
            ['Color', '#cbce2c'],
        ];
        await validateDetiailsList(page, '#qc-flag-type', detailsContentValidators);
    });

    it('should succesfully update QC Flag Type', async () => {
        await goToPage(page, 'qc-flag-type-details', { queryParameters: { id: 11 } });

        await pressElement(page, '#edit');
        await page.waitForSelector('#edit', { hidden: true });
        await page.waitForSelector('#confirm-edit.button.btn');
        await page.waitForSelector('#cancel-edit.button.btn');

        const detailsContainerSelector = '#qc-flag-type';
        await fillInput(page, `${detailsContainerSelector} > div:nth-of-type(2) input`, 'LimAc');
        await fillInput(page, `${detailsContainerSelector} > div:nth-of-type(3) input`, 'Lim Ac');
        await fillInput(page, `${detailsContainerSelector} > div:nth-of-type(4) input`, false);
        await fillInput(page, `${detailsContainerSelector} > div:nth-of-type(9) input`, true);
        await fillInput(page, `${detailsContainerSelector} > div:nth-of-type(10) input`, '#aabb00');

        await pressElement(page, '#confirm-edit.button.btn');
        await page.waitForSelector('#edit');

        const detailsContentValidators = [
            ['ID', '11'],
            ['Name', 'LimAc'],
            ['Method', 'Lim Ac'],
            ['Bad', 'No'],
            ['Last modified', (d) => String(new Date(d)) !== 'Invalid Date'],
            ['Last modified by', 'Anonymous'],
            ['Created at', (d) => String(new Date(d)) !== 'Invalid Date'],
            ['Created by', 'Anonymous'],
            ['Archived', 'Yes'],
            ['Color', '#aabb00'],
        ];
        await validateDetiailsList(page, '#qc-flag-type', detailsContentValidators);
    });
};
