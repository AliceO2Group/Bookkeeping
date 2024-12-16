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
                runNumber: 106,
                dplDetectorId: 1,
            },
        });

        // We expect the page to return the correct status code, making sure the server is running properly
        expect(response.status()).to.equal(200);

        // We expect the page to return the correct title, making sure there isn't another server running on this port
        const title = await page.title();
        expect(title).to.equal('AliceO2 Bookkeeping');

        await expectInnerText(page, 'h2:nth-of-type(1)', 'QC');
        await expectInnerText(page, 'h2:nth-of-type(2)', 'LHC22b_apass1');
        await expectInnerText(page, 'h2:nth-of-type(3)', '106');
        await expectInnerText(page, 'h2:nth-of-type(4)', 'CPV');
    });

    it('can navigate to runs per data pass page from breadcrumbs link', async () => {
        await goToPage(page, 'qc-flag-creation-for-data-pass', {
            queryParameters: {
                dataPassId: 1,
                runNumber: 106,
                dplDetectorId: 1,
            },
        });

        await waitForNavigation(page, () => pressElement(page, '.breadcrumbs *:nth-child(3) a'));
        expectUrlParams(page, { page: 'runs-per-data-pass', dataPassId: '1' });
    });

    it('can navigate to run details page from breadcrumbs link', async () => {
        await goToPage(page, 'qc-flag-creation-for-data-pass', {
            queryParameters: {
                dataPassId: 1,
                runNumber: 106,
                dplDetectorId: 1,
            },
        });

        await waitForNavigation(page, () => pressElement(page, '.breadcrumbs *:nth-child(5) a'));
        expectUrlParams(page, { page: 'run-detail', runNumber: '106' });
    });

    it('should successfully create run-based QC flag', async () => {
        await goToPage(page, 'qc-flag-creation-for-data-pass', {
            queryParameters: {
                dataPassId: 1,
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
                runNumber: 106,
                dplDetectorId: 1,
            },
        });

        await page.waitForSelector('button#submit[disabled]');
        await expectInnerText(page, '.flex-row > .panel:nth-of-type(1) > div', '08/08/2019\n13:00:00');
        await expectInnerText(page, '.flex-row > .panel:nth-of-type(2) > div', '09/08/2019\n14:00:00');
        await page.waitForSelector('input[type="time"]', { hidden: true });

        await pressElement(page, '#flag-type-panel .popover-trigger');
        await pressElement(page, '#flag-type-dropdown-option-11', true);

        await page.waitForSelector('button#submit[disabled]', { hidden: true });
        await pressElement(page, '.flex-row > .panel:nth-of-type(3) input[type="checkbox"]', true);

        await fillInput(page, '.flex-column.g1:nth-of-type(1) > div input[type="time"]', '13:01:01', ['change']);
        await fillInput(page, '.flex-column.g1:nth-of-type(2) > div input[type="time"]', '13:50:59', ['change']);

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
                runNumber: 105,
                dplDetectorId: 1,
            },
        });

        await expectInnerText(page, '.panel:nth-child(3) em', 'Missing start/stop, the flag will be applied on the full run');
        await page.waitForSelector('button#submit[disabled]');
        await page.waitForSelector('input[type="time"]', { hidden: true, timeout: 250 });
        await pressElement(page, '#flag-type-panel .popover-trigger');
        await pressElement(page, '#flag-type-dropdown-option-2', true);
        await page.waitForSelector('button#submit[disabled]', { hidden: true, timeout: 250 });
        await page.waitForSelector('.flex-row > .panel:nth-of-type(3) input[type="checkbox"]', { hidden: true, timeout: 250 });

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
            runNumber: 2,
            dplDetectorId: 1,
        } });

        await expectInnerText(page, '.alert.alert-danger', 'Quality of the run was changed to bad so it is no more subject to QC');
        await page.waitForSelector('input', { hidden: true });
    });

    it('should allow multiple runs and detectors', async () => {
        await goToPage(page, 'qc-flag-creation-for-data-pass', { queryParameters: {
            dataPassId: 2,
            runNumbers: '105,106',
            dplDetectorIds: '2,3'
        } });

        // We expect the page to return the correct status code, making sure the server is running properly
        expect(response.status()).to.equal(200);

        // We expect the page to return the correct title, making sure there isn't another server running on this port
        const title = await page.title();
        expect(title).to.equal('AliceO2 Bookkeeping');

        await expectInnerText(page, 'h2:nth-of-type(1)', 'LHC22b_apass1');

        // Shoudld have a qc flag overview button next to each run-detector pair
        await expectInnerText(page, 'h2:nth-of-type(2)', 'QC');
        await expectInnerText(page, 'h2:nth-of-type(3)', 'QC');

        await expectInnerText(page, 'h4:nth-of-type(1)', '105');
        await expectInnerText(page, 'h4:nth-of-type(2)', 'CPV');
        await expectInnerText(page, 'h4:nth-of-type(3)', '106');
        await expectInnerText(page, 'h4:nth-of-type(4)', 'ALL');
    });

    it('should merge the start times to the minimum and end times to maximum of multiple detectors/runs.', async () => {
        await goToPage(page, 'qc-flag-creation-for-data-pass', {
            queryParameters: {
                dataPassId: 1,
                runNumbers: '105,106',
                dplDetectorIds: '2,3',
            },
        });

        await expectInnerText(page, '.flex-row > .panel:nth-of-type(1) > div', '08/08/2019\n13:00:00');
        await expectInnerText(page, '.flex-row > .panel:nth-of-type(2) > div', '09/08/2019\n14:00:00');

        // Check if timebased can be set true 
        await expectInnerText(page, 'em:nth-of-type(1)', 'The flag will be applied on the full run');
    });

    it('should set the timebased false and end time none if at least one run has no end time.', async () => {
        await goToPage(page, 'qc-flag-creation-for-data-pass', {
            queryParameters: {
                dataPassId: 1,
                runNumbers: '105,106',
                dplDetectorIds: '2,3',
            },
        });

        await expectInnerText(page, '.flex-row > .panel:nth-of-type(1) > div', '08/08/2019\n13:00:00');
        await expectInnerText(page, '.flex-row > .panel:nth-of-type(2) > div', '-');

        // Check if timebased can be set true 
        await expectInnerText(page, 'em:nth-of-type(1)', 'Missing start/stop, the flag will be applied on the full run');
    });

    it('should successfully create QC flags for each run-detector pair ', async () => {
        await goToPage(page, 'qc-flag-creation-for-data-pass', {
            queryParameters: {
                dataPassId: 1,
                runNumbers: '105,106',
                dplDetectorIds: '2,3',
            },
        });
        
        // each qc overview button should lead to correct page
    });
};
