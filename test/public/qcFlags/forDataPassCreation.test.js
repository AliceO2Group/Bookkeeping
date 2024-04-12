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
    validateElement,
    waitForNavigation,
    getColumnCellsInnerTexts,
    fillInput,
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
        const response = await goToPage(page, 'qc-flag-creation-for-data-pass', { queryParameters: {
            dataPassId: 1,
            runNumber: 106,
            dplDetectorId: 1,
        } });

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

    it('can naviagate to runs per data pass page from breadcrumbs link', async () => {
        await goToPage(page, 'qc-flag-creation-for-data-pass', { queryParameters: {
            dataPassId: 1,
            runNumber: 106,
            dplDetectorId: 1,
        } });

        await pressElement(page, 'h2:nth-of-type(2)');
        expect(await checkMismatchingUrlParam(page, { page: 'runs-per-data-pass', dataPassId: '1' })).to.be.eql({});
    });

    it('can naviagate to run details page from breadcrumbs link', async () => {
        await goToPage(page, 'qc-flag-creation-for-data-pass', { queryParameters: {
            dataPassId: 1,
            runNumber: 106,
            dplDetectorId: 1,
        } });

        await pressElement(page, 'h2:nth-of-type(3)');
        expect(await checkMismatchingUrlParam(page, { page: 'run-detail', runNumber: '106' })).to.be.eql({});
    });

    it('should successfuly create run-based QC flag', async () => {
        await goToPage(page, 'qc-flag-creation-for-data-pass', { queryParameters: {
            dataPassId: 1,
            runNumber: 106,
            dplDetectorId: 1,
        } });

        await validateElement(page, 'button#submit[disabled]');
        await expectInnerText(page, '.flex-row > .panel:nth-of-type(1) > div', '08/08/2019\n13:00:00');
        await expectInnerText(page, '.flex-row > .panel:nth-of-type(2) > div', '09/08/2019\n14:00:00');
        await page.waitForSelector('input[type="time"]', { hidden: true, timeout: 250 });

        await pressElement(page, '.dropdown-option', true);

        await page.waitForSelector('button#submit[disabled]', { hidden: true, timeout: 250 });

        await waitForNavigation(page, () => pressElement(page, 'button#submit'));
        expect(await checkMismatchingUrlParam(page, {
            page: 'qc-flags-for-data-pass',
            dataPassId: '1',
            runNumber: '106',
            dplDetectorId: '1',
        })).to.be.eql({});

        await validateElement(page, 'tbody tr td:nth-of-type(2)');
        const flagTypes = await getColumnCellsInnerTexts(page, 'flagType');
        expect(flagTypes[0]).to.be.equal('Unknown Quality');
    });

    it('should successfuly create time-based QC flag', async () => {
        await goToPage(page, 'qc-flag-creation-for-data-pass', { queryParameters: {
            dataPassId: 1,
            runNumber: 106,
            dplDetectorId: 1,
        } });

        await validateElement(page, 'button#submit[disabled]');
        await expectInnerText(page, '.flex-row > .panel:nth-of-type(1) > div', '08/08/2019\n13:00:00');
        await expectInnerText(page, '.flex-row > .panel:nth-of-type(2) > div', '09/08/2019\n14:00:00');
        await page.waitForSelector('input[type="time"]', { hidden: true, timeout: 250 });
        await pressElement(page, '.dropdown-option:nth-of-type(2)', true);
        await page.waitForSelector('button#submit[disabled]', { hidden: true, timeout: 250 });
        await pressElement(page, '.flex-row > .panel:nth-of-type(3) input[type="checkbox"]', true);

        await fillInput(page, '.flex-column.g1:nth-of-type(1) > div input[type="time"]', '13:01:01', ['change']);
        await fillInput(page, '.flex-column.g1:nth-of-type(2) > div input[type="time"]', '13:50:59', ['change']);

        await waitForNavigation(page, () => pressElement(page, 'button#submit'));
        expect(await checkMismatchingUrlParam(page, {
            page: 'qc-flags-for-data-pass',
            dataPassId: '1',
            runNumber: '106',
            dplDetectorId: '1',
        })).to.be.eql({});

        await validateElement(page, 'tbody tr td:nth-of-type(2)');
        const flagTypes = await getColumnCellsInnerTexts(page, 'flagType');
        const fromTimestamps = await getColumnCellsInnerTexts(page, 'from');
        const toTimestamps = await getColumnCellsInnerTexts(page, 'to');
        expect(flagTypes[0]).to.be.equal('Limited acceptance');
        expect(fromTimestamps[0]).to.be.equal('08/08/2019\n13:01:01');
        expect(toTimestamps[0]).to.be.equal('09/08/2019\n13:50:59');
    });

    it('should successfuly create run-based QC flag in case of missing', async () => {
        await goToPage(page, 'qc-flag-creation-for-data-pass', { queryParameters: {
            dataPassId: 1,
            runNumber: 106,
            dplDetectorId: 1,
        } });

        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.qcFlags.forDataPassCreationModel._canSendTimeBasedQcFlag = false;
            // eslint-disable-next-line no-undef
            model.qcFlags.forDataPassCreationModel.notify();
        });

        await expectInnerText(page, '.alert', 'Can send run-based QC flag only as start or stop of run is missing');
        await validateElement(page, 'button#submit[disabled]');
        await page.waitForSelector('input[type="time"]', { hidden: true, timeout: 250 });
        await pressElement(page, '.dropdown-option', true);
        await page.waitForSelector('button#submit[disabled]', { hidden: true, timeout: 250 });
        await page.waitForSelector('.flex-row > .panel:nth-of-type(3) input[type="checkbox"]', { hidden: true, timeout: 250 });

        await waitForNavigation(page, () => pressElement(page, 'button#submit'));
        expect(await checkMismatchingUrlParam(page, {
            page: 'qc-flags-for-data-pass',
            dataPassId: '1',
            runNumber: '106',
            dplDetectorId: '1',
        })).to.be.eql({});

        await validateElement(page, 'tbody tr td:nth-of-type(2)');
        const flagTypes = await getColumnCellsInnerTexts(page, 'flagType');
        expect(flagTypes[0]).to.be.equal('Unknown Quality');
    });
};