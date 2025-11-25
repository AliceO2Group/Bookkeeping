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
    fillInput,
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
        const response = await goToPage(page, 'qc-flags-for-simulation-pass', { queryParameters: {
            simulationPassId: 1,
            runNumber: 106,
            detectorId: 1,
        } });

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
        await goToPage(page, 'qc-flags-for-simulation-pass', { queryParameters: {
            simulationPassId: 1,
            runNumber: 106,
            detectorId: 1,
        } });

        await waitForNavigation(page, () => pressElement(page, '#breadcrumb-simulation-pass-name'));
        expectUrlParams(page, { page: 'runs-per-simulation-pass', simulationPassId: '1' });
    });

    it('can navigate to run details page from breadcrumbs link', async () => {
        await goToPage(page, 'qc-flags-for-simulation-pass', { queryParameters: {
            simulationPassId: 1,
            runNumber: 106,
            detectorId: 1,
        } });

        await waitForNavigation(page, () => pressElement(page, '#breadcrumb-run-number'));
        expectUrlParams(page, { page: 'run-detail', runNumber: '106' });
    });

    it('shows correct datatypes in respective columns', async () => {
        await goToPage(page, 'qc-flags-for-simulation-pass', { queryParameters: {
            simulationPassId: 1,
            runNumber: 106,
            detectorId: 1,
        } });

        // eslint-disable-next-line jsdoc/require-param
        const validateDate = (date) => date === '-' || !isNaN(dateAndTime.parse(date, 'DD/MM/YYYY hh:mm:ss'));
        const tableDataValidators = {
            flagType: (flagType) => flagType && flagType !== '-',
            createdBy: (userName) => userName && userName !== '-',
            from: (timestamp) => timestamp === 'Whole run coverage' || timestamp === 'From run start' || validateDate(timestamp),
            to: (timestamp) => timestamp === 'Whole run coverage' || timestamp === 'Until run end' || validateDate(timestamp),
            createdAt: validateDate,
            updatedAt: validateDate,
        };

        await validateTableData(page, new Map(Object.entries(tableDataValidators)));
    });

    it('Should display the correct items counter at the bottom of the page', async () => {
        await goToPage(page, 'qc-flags-for-simulation-pass', { queryParameters: {
            simulationPassId: 1,
            runNumber: 106,
            detectorId: 1,
        } });

        await expectInnerText(page, '#firstRowIndex', '1');
        await expectInnerText(page, '#lastRowIndex', '2');
        await expectInnerText(page, '#totalRowsCount', '2');
    });

    it('can set how many entires are available per page', async () => {
        await goToPage(page, 'qc-flags-for-simulation-pass', { queryParameters: {
            simulationPassId: 1,
            runNumber: 106,
            detectorId: 1,
        } });

        const amountSelectorId = '#amountSelector';
        const amountSelectorButtonSelector = `${amountSelectorId} button`;
        await pressElement(page, amountSelectorButtonSelector);

        await page.waitForSelector(`${amountSelectorId} .dropup-menu`);

        const amountItems5 = `${amountSelectorId} .dropup-menu .menu-item:first-child`;
        await pressElement(page, amountItems5);

        await fillInput(page, `${amountSelectorId} input[type=number]`, 1111);
        await page.waitForSelector(amountSelectorId);
    });
};
