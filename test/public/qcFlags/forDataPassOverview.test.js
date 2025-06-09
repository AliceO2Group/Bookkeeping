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
    validateTableData,
    expectUrlParams,
    waitForNavigation,
} = require('../defaults.js');

const { expect } = chai;
const dateAndTime = require('date-and-time');
const { resetDatabaseContent } = require('../../utilities/resetDatabaseContent.js');

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
        await resetDatabaseContent();
    });

    after(async () => {
        [page, browser] = await defaultAfter(page, browser);
    });

    it('loads the page successfully', async () => {
        const response = await goToPage(page, 'qc-flags-for-data-pass', { queryParameters: {
            dataPassId: 1,
            runNumber: 106,
            dplDetectorId: 1,
        } });

        // We expect the page to return the correct status code, making sure the server is running properly
        expect(response.status()).to.equal(200);

        // We expect the page to return the correct title, making sure there isn't another server running on this port
        const title = await page.title();
        expect(title).to.equal('AliceO2 Bookkeeping');

        await expectInnerText(page, '#breadcrumb-header', 'QC');
        await expectInnerText(page, '#breadcrumb-data-pass-name', 'LHC22b_apass1');
        await expectInnerText(page, '#breadcrumb-run-number', '106');
        await expectInnerText(page, '#breadcrumb-detector-name', 'CPV');
    });

    it('can navigate to runs per data pass page from breadcrumbs link', async () => {
        await goToPage(page, 'qc-flags-for-data-pass', { queryParameters: {
            dataPassId: 1,
            runNumber: 106,
            dplDetectorId: 1,
        } });

        await waitForNavigation(page, () => pressElement(page, '#breadcrumb-data-pass-name'));
        expectUrlParams(page, { page: 'runs-per-data-pass', dataPassId: '1' });
    });

    it('can navigate to run details page from breadcrumbs link', async () => {
        await goToPage(page, 'qc-flags-for-data-pass', { queryParameters: {
            dataPassId: 1,
            runNumber: 106,
            dplDetectorId: 1,
        } });

        await waitForNavigation(page, () => pressElement(page, '#breadcrumb-run-number'));
        expectUrlParams(page, { page: 'run-detail', runNumber: '106' });
    });

    it('shows correct datatypes in respective columns', async () => {
        await goToPage(page, 'qc-flags-for-data-pass', { queryParameters: {
            dataPassId: 1,
            runNumber: 106,
            dplDetectorId: 1,
        } });

        // eslint-disable-next-line require-jsdoc
        const validateDate = (date) => date === '-' || !isNaN(dateAndTime.parse(date, 'DD/MM/YYYY hh:mm:ss'));
        const tableDataValidators = {
            flagType: (flagType) => flagType && flagType !== '-',
            createdBy: (userName) => userName && userName !== '-',
            from: (timestamp) => timestamp === 'Whole run coverage' || validateDate(timestamp),
            to: (timestamp) => timestamp === 'Whole run coverage' || validateDate(timestamp),
            createdAt: validateDate,
            updatedAt: validateDate,
        };

        await validateTableData(page, new Map(Object.entries(tableDataValidators)));

        const rects = await page.$$('svg rect');
        expect(rects).to.be.lengthOf(3);
    });

    it('should inform when run quality was changed to bad', async () => {
        await goToPage(page, 'qc-flags-for-data-pass', { queryParameters: {
            dataPassId: 2,
            runNumber: 2,
            dplDetectorId: 1,
        } });

        await page.waitForSelector('#breadcrumb-run-number.danger a');
        const title = 'Quality of run 2 was changed to bad so it is no more subject to QC';
        await page.waitForSelector(`button.btn.btn-primary[disabled][title="${title}"]`);
    });
};
