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
    expectInputValue,
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
        const response = await goToPage(page, 'qc-flag-type-details', { id: 11 });
        expect(response.status()).to.equal(200);

        const title = await page.title();
        expect(title).to.equal('AliceO2 Bookkeeping');
        await expectInnerText(page, 'h2', 'QC Flag Type: LimitedAcceptance');
    });

    it('should dispay correct data', async () => {
        await goToPage(page, 'qc-flag-type-details', { id: 11 });
        const detailsContainerId = 'qc-flag-type';
        const detailsContent = [
            ['ID', '11'],
            ['Name', 'LimitedAcceptance'],
            ['Method', 'Limited acceptance'],
            ['Bad', 'Yes'],
            ['Last modified', (d) => String(new Date(d)) !== 'Invalid Date'],
            ['Last modified by', '-'],
            ['Created at', (d) => String(new Date(d)) !== 'Invalid Date'],
            ['Created by', 'Anonymous'],
            ['Archived', 'No'],
            ['Color', '#cbce2c'],
        ];
        for (const positionInDiv in detailsContent) {
            const [propertyName, value] = detailsContent[positionInDiv];
            await expectInnerText(`#${detailsContainerId} div:nth-of-type(${positionInDiv})`, );
        }
    });

    it('should succesfully update QC Flag Type', async () => {
        await goToPage(page, 'qc-flag-type-details', { id: 11 });
        
    });
};
