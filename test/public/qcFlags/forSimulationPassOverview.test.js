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
    validateElement,
    checkMismatchingUrlParam,
} = require('../defaults');

const { expect } = chai;
const dateAndTime = require('date-and-time');
const { waitForNavigation } = require('../defaults.js');
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
            dplDetectorId: 1,
        } });

        // We expect the page to return the correct status code, making sure the server is running properly
        expect(response.status()).to.equal(200);

        // We expect the page to return the correct title, making sure there isn't another server running on this port
        const title = await page.title();
        expect(title).to.equal('AliceO2 Bookkeeping');

        await expectInnerText(page, 'h2:nth-of-type(1)', 'QC');
        await expectInnerText(page, 'h2:nth-of-type(2)', 'LHC23k6c');
        await expectInnerText(page, 'h2:nth-of-type(3)', '106');
        await expectInnerText(page, 'h2:nth-of-type(4)', 'CPV');
    });

    it('can naviagate to runs per simulation pass page from breadcrumbs link', async () => {
        await goToPage(page, 'qc-flags-for-simulation-pass', { queryParameters: {
            simulationPassId: 1,
            runNumber: 106,
            dplDetectorId: 1,
        } });

        await waitForNavigation(page, () => pressElement(page, 'h2:nth-of-type(2)'));
        expect(await checkMismatchingUrlParam(page, { page: 'runs-per-simulation-pass', simulationPassId: '1' })).to.be.eql({});
    });

    it('can naviagate to run details page from breadcrumbs link', async () => {
        await goToPage(page, 'qc-flags-for-simulation-pass', { queryParameters: {
            simulationPassId: 1,
            runNumber: 106,
            dplDetectorId: 1,
        } });

        await waitForNavigation(page, () => pressElement(page, 'h2:nth-of-type(3)'));
        expect(await checkMismatchingUrlParam(page, { page: 'run-detail', runNumber: '106' })).to.be.eql({});
    });

    it('shows correct datatypes in respective columns', async () => {
        await goToPage(page, 'qc-flags-for-simulation-pass', { queryParameters: {
            simulationPassId: 1,
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
    });

    it('Should display the correct items counter at the bottom of the page', async () => {
        await goToPage(page, 'qc-flags-for-simulation-pass', { queryParameters: {
            simulationPassId: 1,
            runNumber: 106,
            dplDetectorId: 1,
        } });

        await expectInnerText(page, '#firstRowIndex', '1');
        await expectInnerText(page, '#lastRowIndex', '2');
        await expectInnerText(page, '#totalRowsCount', '2');
    });

    it('can set how many entires are available per page', async () => {
        await goToPage(page, 'qc-flags-for-simulation-pass', { queryParameters: {
            simulationPassId: 1,
            runNumber: 106,
            dplDetectorId: 1,
        } });

        const amountSelectorId = '#amountSelector';
        const amountSelectorButtonSelector = `${amountSelectorId} button`;
        await pressElement(page, amountSelectorButtonSelector);

        await validateElement(page, `${amountSelectorId} .dropup-menu`);

        const amountItems5 = `${amountSelectorId} .dropup-menu .menu-item:first-child`;
        await pressElement(page, amountItems5);

        await fillInput(page, `${amountSelectorId} input[type=number]`, 1111);
        await validateElement(page, amountSelectorId);
    });

    it('notifies if table loading returned an error', async () => {
        await goToPage(page, 'qc-flags-for-simulation-pass', { queryParameters: {
            simulationPassId: 1,
            runNumber: 106,
            dplDetectorId: 1,
        } });

        // eslint-disable-next-line no-return-assign, no-undef
        await page.evaluate(() => model.qcFlags.forSimulationPassOverviewModel.pagination.itemsPerPage = 200);

        // We expect there to be a fitting error message
        const expectedMessage = 'Invalid Attribute: "query.page.limit" must be less than or equal to 100';
        await expectInnerText(page, '.alert-danger', expectedMessage);
    });
};
