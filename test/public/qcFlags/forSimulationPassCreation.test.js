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
} = require('../defaults.js');
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
        const response = await goToPage(page, 'qc-flag-creation-for-simulation-pass', {
            queryParameters: {
                simulationPassId: 1,
                runNumber: 106,
                dplDetectorId: 1,
            },
        });

        // We expect the page to return the correct status code, making sure the server is running properly
        expect(response.status()).to.equal(200);

        // We expect the page to return the correct title, making sure there isn't another server running on this port
        const title = await page.title();
        expect(title).to.equal('AliceO2 Bookkeeping');

        await expectInnerText(page, '#breadcrumb-header', 'QC');
        await expectInnerText(page, '#breadcrumb-simulation-pass-name', 'LHC23k6c');
        await expectInnerText(page, '#breadcrumb-run-number', '106');
        await expectInnerText(page, '#breadcrumb-detector-name', 'CPV');
    });

    it('can navigate to runs per simulation pass page from breadcrumbs link', async () => {
        await goToPage(page, 'qc-flag-creation-for-simulation-pass', {
            queryParameters: {
                simulationPassId: 1,
                runNumber: 106,
                dplDetectorId: 1,
            },
        });

        await waitForNavigation(page, () => pressElement(page, '#breadcrumb-simulation-pass-name a'));
        expectUrlParams(page, { page: 'runs-per-simulation-pass', simulationPassId: '1' });
    });

    it('can navigate to run details page from breadcrumbs link', async () => {
        await goToPage(page, 'qc-flag-creation-for-simulation-pass', {
            queryParameters: {
                simulationPassId: 1,
                runNumber: 106,
                dplDetectorId: 1,
            },
        });

        await waitForNavigation(page, () => pressElement(page, '#breadcrumb-run-number a'));
        expectUrlParams(page, { page: 'run-detail', runNumber: '106' });
    });

    it('should successfully create run-based QC flag', async () => {
        await goToPage(page, 'qc-flag-creation-for-simulation-pass', {
            queryParameters: {
                simulationPassId: 1,
                runNumber: 106,
                dplDetectorId: 1,
            },
        });

        await page.waitForSelector('button#submit[disabled]');
        await expectInnerText(page, '.flex-row > .panel:nth-of-type(1) > div', '08/08/2019\n13:00:00');
        await expectInnerText(page, '.flex-row > .panel:nth-of-type(2) > div', '09/08/2019\n14:00:00');
        await page.waitForSelector('input[type="time"]', { hidden: true, timeout: 250 });

        await pressElement(page, '#flag-type-panel .popover-trigger');
        await pressElement(page, '#flag-type-dropdown-option-2', true);

        await page.waitForSelector('button#submit[disabled]', { hidden: true, timeout: 250 });

        await waitForNavigation(page, () => pressElement(page, 'button#submit'));
        expectUrlParams(page, {
            page: 'qc-flags-for-simulation-pass',
            simulationPassId: '1',
            runNumber: '106',
            dplDetectorId: '1',
        });

        await expectRowValues(page, 1, {
            flagType: 'Unknown Quality',
        });
    });

    it('should successfully create time-based QC flag', async () => {
        await goToPage(page, 'qc-flag-creation-for-simulation-pass', {
            queryParameters: {
                simulationPassId: 1,
                runNumber: 106,
                dplDetectorId: 1,
            },
        });

        await page.waitForSelector('button#submit[disabled]');
        await expectInnerText(page, '.flex-row > .panel:nth-of-type(1) > div', '08/08/2019\n13:00:00');
        await expectInnerText(page, '.flex-row > .panel:nth-of-type(2) > div', '09/08/2019\n14:00:00');
        await page.waitForSelector('input[type="time"]', { hidden: true, timeout: 250 });
        await pressElement(page, '#flag-type-panel .popover-trigger');
        await pressElement(page, '#flag-type-dropdown-option-11', true);
        await page.waitForSelector('button#submit[disabled]', { hidden: true, timeout: 250 });
        await pressElement(page, '.flex-row > .panel:nth-of-type(3) input[type="checkbox"]', true);

        await fillInput(page, '.flex-column.g1:nth-of-type(1) > div input[type="time"]', '13:01:01', ['change']);
        await fillInput(page, '.flex-column.g1:nth-of-type(2) > div input[type="time"]', '13:50:59', ['change']);

        await waitForNavigation(page, () => pressElement(page, 'button#submit'));
        expectUrlParams(page, {
            page: 'qc-flags-for-simulation-pass',
            simulationPassId: '1',
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
        await goToPage(page, 'qc-flag-creation-for-simulation-pass', {
            queryParameters: {
                simulationPassId: 1,
                runNumber: 105,
                dplDetectorId: 1,
            },
        });

        await expectInnerText(page, '.panel:nth-child(3) em', 'Missing start/stop, the flag will be applied on the full run');
        await page.waitForSelector('button#submit[disabled]');
        await page.waitForSelector('input[type="time"]', { hidden: true });
        await pressElement(page, '#flag-type-panel .popover-trigger');
        await pressElement(page, '#flag-type-dropdown-option-2', true);
        await page.waitForSelector('button#submit[disabled]', { hidden: true });
        await page.waitForSelector('.flex-row > .panel:nth-of-type(3) input[type="checkbox"]', { hidden: true });

        await waitForNavigation(page, () => pressElement(page, 'button#submit'));
        expectUrlParams(page, {
            page: 'qc-flags-for-simulation-pass',
            simulationPassId: '1',
            runNumber: '105',
            dplDetectorId: '1',
        });

        await expectColumnValues(page, 'flagType', ['Unknown Quality']);
    });
};
