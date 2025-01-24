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
    waitForNavigation,
    fillInput,
    expectColumnValues,
    expectRowValues,
    expectUrlParams,
} = require('../defaults');
const { resetDatabaseContent } = require('../../utilities/resetDatabaseContent.js');

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
        await resetDatabaseContent();
    });

    after(async () => {
        [page, browser] = await defaultAfter(page, browser);
    });

    it('loads the page successfully', async () => {
        const response = await goToPage(page, 'qc-flag-creation-for-data-pass', {
            queryParameters: {
                dataPassId: 1,
                runNumberDetectorMap: '106:1',
            },
        });

        // We expect the page to return the correct status code, making sure the server is running properly
        expect(response.status()).to.equal(200);

        // We expect the page to return the correct title, making sure there isn't another server running on this port
        const title = await page.title();
        expect(title).to.equal('AliceO2 Bookkeeping');

        await expectInnerText(page, '#global-container > div > h2 > a', 'LHC22b_apass1');
    });

    it('can navigate to runs per data pass page from breadcrumbs link', async () => {
        await goToPage(page, 'qc-flag-creation-for-data-pass', {
            queryParameters: {
                dataPassId: 1,
                runNumberDetectorMap: '106:1',
            },
        });

        await waitForNavigation(page, () => pressElement(page, '#global-container > div > h2 > a'));
        expectUrlParams(page, { page: 'runs-per-data-pass', dataPassId: '1' });
    });

    it('can navigate to run details page from breadcrumbs link', async () => {
        await goToPage(page, 'qc-flag-creation-for-data-pass', {
            queryParameters: {
                dataPassId: 1,
                runNumberDetectorMap: '106:1',
            },
        });

        await waitForNavigation(page, () => pressElement(page, 'table > tbody > tr:nth-child(1) > td:nth-child(1) > a'));
        expectUrlParams(page, { page: 'run-detail', runNumber: '106' });
    });

    it('should successfully create run-based QC flag', async () => {
        await goToPage(page, 'qc-flag-creation-for-data-pass', {
            queryParameters: {
                dataPassId: 1,
                runNumberDetectorMap: '106:1',
            },
        });

        await page.waitForSelector('button#submit[disabled]');
        await expectInnerText(page, 'table > tbody > tr > td:nth-child(3) > div', '08/08/2019\n13:00:00');
        await expectInnerText(page, 'table > tbody > tr > td:nth-child(4) > div', '09/08/2019\n14:00:00');
        await page.waitForSelector('input[type="time"]', { hidden: true, timeout: 250 });

        await pressElement(page, '#flag-type-panel .popover-trigger');
        await pressElement(page, '#flag-type-dropdown-option-2', true);

        await page.waitForSelector('button#submit[disabled]', { hidden: true, timeout: 250 });

        await waitForNavigation(page, () => pressElement(page, 'button#submit'));
        expectUrlParams(page, {
            page: 'qc-flags-for-data-pass',
            dataPassId: '1',
            runNumber: '106',
            dplDetectorId: '1',
        });

        await expectRowValues(page, 1, {
            flagType: 'Unknown Quality',
        });
    });

    it('should successfully create time-based QC flag', async () => {
        await goToPage(page, 'qc-flag-creation-for-data-pass', {
            queryParameters: {
                dataPassId: 1,
                runNumberDetectorMap: '106:1',
            },
        });

        await page.waitForSelector('button#submit[disabled]');
        await expectInnerText(page, 'table > tbody > tr > td:nth-child(3) > div', '08/08/2019\n13:00:00');
        await expectInnerText(page, 'table > tbody > tr > td:nth-child(4) > div', '09/08/2019\n14:00:00');
        await page.waitForSelector('input[type="time"]', { hidden: true });

        await pressElement(page, '#flag-type-panel .popover-trigger');
        await pressElement(page, '#flag-type-dropdown-option-11', true);

        await page.waitForSelector('button#submit[disabled]', { hidden: true });
        await pressElement(page, '#time-based-toggle', true);

        await fillInput(page, 'div:nth-child(1) > div > input:nth-child(2)', '13:01:01', ['change']);
        await fillInput(page, 'div:nth-child(2) > div > input:nth-child(2)', '13:50:59', ['change']);

        await waitForNavigation(page, () => pressElement(page, 'button#submit'));
        expectUrlParams(page, {
            page: 'qc-flags-for-data-pass',
            dataPassId: '1',
            runNumber: '106',
            dplDetectorId: '1',
        });

        await expectRowValues(page, 1, {
            flagType: 'Limited acceptance',
            from: '08/08/2019\n13:01:01',
            to: '09/08/2019\n13:50:59',
        });
    });

    it('should successfully create run-based QC flag in case of missing run start/stop', async () => {
        await goToPage(page, 'qc-flag-creation-for-data-pass', {
            queryParameters: {
                dataPassId: 3,
                runNumberDetectorMap: '105:1',
            },
        });

        await expectInnerText(
            page,
            'div.panel.flex-grow.items-center > div > em',
            'Missing start/stop, the flag will be applied on the full run',
        );
        await page.waitForSelector('button#submit[disabled]');
        await page.waitForSelector('input[type="time"]', { hidden: true, timeout: 250 });
        await pressElement(page, '#flag-type-panel .popover-trigger');
        await pressElement(page, '#flag-type-dropdown-option-2', true);
        await page.waitForSelector('button#submit[disabled]', { hidden: true, timeout: 250 });
        await page.waitForSelector('#time-based-toggle', { hidden: true, timeout: 250 });

        await waitForNavigation(page, () => pressElement(page, 'button#submit'));
        expectUrlParams(page, {
            page: 'qc-flags-for-data-pass',
            dataPassId: '3',
            runNumber: '105',
            dplDetectorId: '1',
        });

        await expectColumnValues(page, 'flagType', ['Unknown Quality']);
    });

    it('should disabled creation form when run quality was changes to bad', async () => {
        await goToPage(page, 'qc-flag-creation-for-data-pass', { queryParameters: {
            dataPassId: 2,
            runNumberDetectorMap: '2:1',
        } });

        await expectInnerText(page, '.alert.alert-danger', 'Quality of run 2 was changed to bad so it is no more subject to QC');
        await page.waitForSelector('input', { hidden: true });
    });

    it('should allow multiple runs and detectors to be selected', async () => {
        await goToPage(page, 'qc-flag-creation-for-data-pass', { queryParameters: {
            dataPassId: 3,
            runNumberDetectorMap: '56:7,4;54:4',
        } });

        await expectInnerText(page, 'table > tbody > tr:nth-child(1) > td:nth-child(2)', 'ITS');
        await expectInnerText(page, 'table > tbody > tr:nth-child(2) > td:nth-child(2)', 'FT0, ITS');
    });

    it('should have timebased false and display no overlap if times dont overlap', async () => {
        await goToPage(page, 'qc-flag-creation-for-data-pass', { queryParameters: {
            dataPassId: 3,
            runNumberDetectorMap: '54:4;56:4',
        } });

        await expectInnerText(page, 'div.panel.flex-grow.items-center > div > em', "The selected runs don't have overlapping start/stop times");
        await page.waitForSelector('input[type="time"]', { hidden: true });
    });

    it('should set the timebased unavailable if at least one run has no end time and multiple are selected', async () => {
        await goToPage(page, 'qc-flag-creation-for-data-pass', { queryParameters: {
            dataPassId: 3,
            runNumberDetectorMap: '54:4;49:4',
        } });

        await expectInnerText(
            page,
            'div.panel.flex-grow.items-center > div > em',
            'Missing start/stop, the flag will be applied on the full run',
        );
        await page.waitForSelector('#time-based-toggle[disabled]');
    });

    it('should successfully create QC flags for multiple detectors and runs', async () => {
        await goToPage(page, 'qc-flag-creation-for-data-pass', {
            queryParameters: {
                dataPassId: 5,
                runNumberDetectorMap: '56:4,7;54:4',
            },
        });

        await page.waitForSelector('button#submit[disabled]');
        await pressElement(page, '#flag-type-panel .popover-trigger');
        await pressElement(page, '#flag-type-dropdown-option-2', true);
        await page.waitForSelector('button#submit[disabled]', { hidden: true });

        await waitForNavigation(page, () => pressElement(page, 'button#submit'));
        expectUrlParams(page, {
            page: 'runs-per-data-pass',
            dataPassId: '5',
        });

        await page.waitForSelector('.select-multi-flag');
        expect(page.$$('.select-multi-flag')).to.have.lengthOf(3);
    });
};
