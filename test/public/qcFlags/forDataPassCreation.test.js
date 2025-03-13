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
    waitForTableLength,
} = require('../defaults.js');
const { resetDatabaseContent } = require('../../utilities/resetDatabaseContent.js');

const { expect } = chai;

/**
 * Navigate to runs per data pass by navigating to data pass per period first
 *
 * @param {puppeteer.Page} page puppeteer page
 * @param {number} lhcPeriodId id of the period to which data pass is linked
 * @param {number} dataPassId id of the data pass that needs to be displayed
 * @return {Promise<void>} resolve once the navigation is finished
 */
const navigateToRunsPerDataPass = async (page, lhcPeriodId, dataPassId) => {
    await waitForNavigation(page, () => pressElement(page, '#lhc-period-overview', true));
    await waitForNavigation(page, () => pressElement(page, `#row${lhcPeriodId}-associatedDataPasses-text a`, true));
    await waitForNavigation(page, () => pressElement(page, `#row${dataPassId}-associatedRuns-text a`, true));
};

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
                runNumberDetectorsMap: '106:1',
            },
        });

        // We expect the page to return the correct status code, making sure the server is running properly
        expect(response.status()).to.equal(200);

        // We expect the page to return the correct title, making sure there isn't another server running on this port
        const title = await page.title();
        expect(title).to.equal('AliceO2 Bookkeeping');

        await expectInnerText(page, '#global-container > div > h2 > a', 'LHC22b_apass1');
    });

    it('can navigate to runs per data pass page from title link', async () => {
        await goToPage(page, 'qc-flag-creation-for-data-pass', {
            queryParameters: {
                dataPassId: 1,
                runNumberDetectorsMap: '106:1',
            },
        });

        await waitForNavigation(page, () => pressElement(page, 'h2 a'));
        expectUrlParams(page, { page: 'runs-per-data-pass', dataPassId: '1' });
    });

    it('can navigate to run details page from table link', async () => {
        await goToPage(page, 'qc-flag-creation-for-data-pass', {
            queryParameters: {
                dataPassId: 1,
                runNumberDetectorsMap: '106:1',
            },
        });

        await waitForNavigation(page, () => pressElement(page, 'table > tbody > tr:nth-child(1) > td:nth-child(1) > a'));
        expectUrlParams(page, { page: 'run-detail', runNumber: '106' });
    });

    it('should successfully create run-based QC flag', async () => {
        await goToPage(page, 'qc-flag-creation-for-data-pass', {
            queryParameters: {
                dataPassId: 1,
                runNumberDetectorsMap: '106:1',
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
            page: 'runs-per-data-pass',
            dataPassId: '1',
        });

        await waitForNavigation(page, () => pressElement(page, '#row106-CPV-text a'));
        await waitForTableLength(page, 4);

        await expectRowValues(page, 1, {
            flagType: 'Unknown Quality',
        });
    });

    it('should successfully create time-based QC flag', async () => {
        await goToPage(page, 'qc-flag-creation-for-data-pass', {
            queryParameters: {
                dataPassId: 1,
                runNumberDetectorsMap: '106:1',
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
            page: 'runs-per-data-pass',
            dataPassId: '1',
        });

        await waitForNavigation(page, () => pressElement(page, '#row106-CPV-text a'));
        await waitForTableLength(page, 5);

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
                runNumberDetectorsMap: '105:1',
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
            page: 'runs-per-data-pass',
            dataPassId: '3',
        });

        await waitForNavigation(page, () => pressElement(page, '#row105-CPV-text a'));
        await waitForTableLength(page, 1);

        await expectColumnValues(page, 'flagType', ['Unknown Quality']);
    });

    it('should disabled creation form when run quality was changes to bad', async () => {
        await goToPage(page, 'qc-flag-creation-for-data-pass', {
            queryParameters: {
                dataPassId: 2,
                runNumberDetectorsMap: '2:1',
            },
        });

        await expectInnerText(page, '.alert.alert-danger', 'Quality of run 2 was changed to bad so it is no more subject to QC');
        await page.waitForSelector('input', { hidden: true });

        await goToPage(page, 'qc-flag-creation-for-data-pass', {
            queryParameters: {
                dataPassId: 2,
                runNumberDetectorsMap: '2:1;55:7',
            },
        });

        await expectInnerText(page, '.alert.alert-danger', 'Quality of run 2 was changed to bad so it is no more subject to QC');
        await page.waitForSelector('input', { hidden: true });
    });

    it('should allow multiple runs and detectors to be selected', async () => {
        await navigateToRunsPerDataPass(page, 1, 3);

        await pressElement(page, '#row56-FT0-text .select-multi-flag');
        await pressElement(page, '#row56-ITS-text .select-multi-flag');
        await pressElement(page, '#row54-ITS-text .select-multi-flag');
        // Select then de-select one checkbox
        await pressElement(page, '#row49-ITS-text .select-multi-flag');
        await pressElement(page, '#row49-ITS-text .select-multi-flag');

        await pressElement(page, '#actions-dropdown-button .popover-trigger', true);
        await waitForNavigation(page, () => pressElement(page, '#set-qc-flags-trigger'));

        // Runs are ordered by run number
        await waitForTableLength(page, 2);
        await expectInnerText(page, 'table > tbody > tr:nth-child(1) > td:nth-child(2)', 'FT0, ITS');
        await expectInnerText(page, 'table > tbody > tr:nth-child(2) > td:nth-child(2)', 'ITS');
    });

    it('should have timebased false and display no overlap if times dont overlap', async () => {
        await navigateToRunsPerDataPass(page, 1, 3);
        await pressElement(page, '#row54-ITS-text .select-multi-flag');
        await pressElement(page, '#row56-ITS-text .select-multi-flag');

        await pressElement(page, '#actions-dropdown-button .popover-trigger', true);
        await waitForNavigation(page, () => pressElement(page, '#set-qc-flags-trigger'));

        await expectInnerText(page, 'div.panel.flex-grow.items-center > div > em', 'The selected runs don\'t have overlapping start/stop times');
        await page.waitForSelector('input[type="time"]', { hidden: true });
    });

    it('should set the timebased unavailable if at least one run has no end time and multiple are selected', async () => {
        await navigateToRunsPerDataPass(page, 1, 3);
        await pressElement(page, '#row54-ITS-text .select-multi-flag');
        await pressElement(page, '#row49-ITS-text .select-multi-flag');

        await pressElement(page, '#actions-dropdown-button .popover-trigger', true);
        await waitForNavigation(page, () => pressElement(page, '#set-qc-flags-trigger'));

        await expectInnerText(
            page,
            'div.panel.flex-grow.items-center > div > em',
            'Missing start/stop, the flag will be applied on the full run',
        );
        await page.waitForSelector('#time-based-toggle[disabled]');
    });

    it('should successfully create QC flags for multiple detectors and runs', async () => {
        await navigateToRunsPerDataPass(page, 2, 5);
        await pressElement(page, '#row56-ITS-text .select-multi-flag');
        await pressElement(page, '#row56-FT0-text .select-multi-flag');
        await pressElement(page, '#row54-ITS-text .select-multi-flag');

        await pressElement(page, '#actions-dropdown-button .popover-trigger', true);
        await waitForNavigation(page, () => pressElement(page, '#set-qc-flags-trigger'));

        await page.waitForSelector('button#submit[disabled]');
        await pressElement(page, '#flag-type-panel .popover-trigger');
        await pressElement(page, '#flag-type-dropdown-option-2', true);
        await page.waitForSelector('button#submit[disabled]', { hidden: true });

        await waitForNavigation(page, () => pressElement(page, 'button#submit'));
        expectUrlParams(page, {
            page: 'runs-per-data-pass',
            dataPassId: '5',
        });

        await waitForTableLength(page, 4);
    });
};
