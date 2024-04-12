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
    expectInnerText,
    pressElement,
    goToPage,
    checkMismatchingUrlParam,
    waitForNavigation,
} = require('../defaults');

const { expect } = chai;

module.exports = () => {
    let page;
    let browser;

    before(async () => {
        [page, browser] = await defaultBefore(page, browser);
        await page.setViewport({
            width: 1200,
            height: 720,
            deviceScaleFactor: 1,
        });
    });

    after(async () => {
        [page, browser] = await defaultAfter(page, browser);
    });

    it('loads the page successfully', async () => {
        const response = await goToPage(page, 'qc-flag-details', { queryParameters: {
            id: 1,
        } });

        // We expect the page to return the correct status code, making sure the server is running properly
        expect(response.status()).to.equal(200);

        // We expect the page to return the correct title, making sure there isn't another server running on this port
        const title = await page.title();
        expect(title).to.equal('AliceO2 Bookkeeping');

        await expectInnerText(page, 'h2', 'QC Flag Details');
    });

    it('can naviagate to run details page from breadcrumbs link', async () => {
        await goToPage(page, 'qc-flag-details', { queryParameters: {
            id: 1,
        } });
        await waitForNavigation(page, () => pressElement(page, '#qc-flag-details-run a'));
        expect(await checkMismatchingUrlParam(page, { page: 'run-detail', runNumber: '106' })).to.be.eql({});
    });
    it('should display correct QC flag details', async () => {
        await goToPage(page, 'qc-flag-details', { queryParameters: {
            id: 1,
        } });

        await expectInnerText(page, '#qc-flag-details-id', '1');
        await expectInnerText(page, '#qc-flag-details-run', '106');
        await expectInnerText(page, '#qc-flag-details-dplDetector', 'CPV');
        await expectInnerText(page, '#qc-flag-details-flagType', 'Limited acceptance');
        await expectInnerText(page, '#qc-flag-details-from', '2019-08-08, 22:43:20');
        await expectInnerText(page, '#qc-flag-details-to', '2019-08-09, 04:16:40');
        await expectInnerText(page, '#qc-flag-details-createdBy', 'John Doe');
        await expectInnerText(page, '#qc-flag-details-createdAt', '2024-02-13, 11:57:16');
        await expectInnerText(page, '.panel div', 'Some qc comment 1');
    });
};
