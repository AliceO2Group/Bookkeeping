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

const path = require('path');
const fs = require('fs');
const chai = require('chai');
const {
    defaultBefore,
    defaultAfter,
    expectInnerText,
    pressElement,
    goToPage,
    validateTableData,
    fillInput,
    validateDate,
    expectLink,
    reloadPage,
    waitForDownload,
    waitForNavigation,
    expectUrlParams,
    testTableSortingByColumn,
    waitForTableLength,
} = require('../defaults.js');

const { expect } = chai;
const { qcFlagService } = require('../../../lib/server/services/qualityControlFlag/QcFlagService');
const { resetDatabaseContent } = require('../../utilities/resetDatabaseContent.js');

const DETECTORS = [
    'CPV',
    'EMC',
    'FDD',
    'FT0',
    'FV0',
    'HMP',
    'ITS',
    'MCH',
    'MFT',
    'MID',
    'PHS',
    'TOF',
    'TPC',
    'TRD',
    'ZDC',
];

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
        const response = await goToPage(page, 'runs-per-simulation-pass', { queryParameters: { simulationPassId: 2 } });

        // We expect the page to return the correct status code, making sure the server is running properly
        expect(response.status()).to.equal(200);

        // We expect the page to return the correct title, making sure there isn't another server running on this port
        const title = await page.title();
        expect(title).to.equal('AliceO2 Bookkeeping');

        await page.waitForSelector('h2');
        const headerBreadcrumbs = await page.$$('h2');
        expect(await headerBreadcrumbs[0].evaluate((element) => element.innerText)).to.be.equal('Runs per MC');
        expect(await headerBreadcrumbs[1].evaluate((element) => element.innerText)).to.be.equal('LHC23k6b');
    });

    it('shows correct datatypes in respective columns', async () => {
        const tableDataValidators = {
            runNumber: (number) => !isNaN(number),
            fillNumber: (number) => number === '-' || !isNaN(number),

            timeO2Start: (date) => date === '-' || validateDate(date),
            timeO2End: (date) => date === '-' || validateDate(date),
            timeTrgStart: (date) => date === '-' || validateDate(date),
            timeTrgEnd: (date) => date === '-' || validateDate(date),

            aliceL3Current: (current) => !isNaN(Number(current.replace(/,/g, ''))),
            dipoleCurrent: (current) => !isNaN(Number(current.replace(/,/g, ''))),

            inelasticInteractionRateAvg: (value) => value === '-' || !isNaN(Number(value.replace(/,/g, ''))),
            inelasticInteractionRateAtStart: (value) => value === '-' || !isNaN(Number(value.replace(/,/g, ''))),
            inelasticInteractionRateAtMid: (value) => value === '-' || !isNaN(Number(value.replace(/,/g, ''))),
            inelasticInteractionRateAtEnd: (value) => value === '-' || !isNaN(Number(value.replace(/,/g, ''))),
            ...Object.fromEntries(DETECTORS.map((detectorName) => [
                detectorName,
                (qualityDisplay) => !qualityDisplay || /(QC)|(\d+)/.test(qualityDisplay),
            ])),
        };

        await validateTableData(page, new Map(Object.entries(tableDataValidators)));

        await expectLink(page, 'tr#row56 .column-ITS a', {
            href: 'http://localhost:4000/?page=qc-flag-creation-for-simulation-pass&runNumberDetectorsMap=56:4&simulationPassId=2',
            innerText: 'QC',
        });

        const [tmpQcFlag] = await qcFlagService.create(
            [{ flagTypeId: 2 }],
            { runNumber: 56, simulationPassIdentifier: { id: 2 }, detectorIdentifier: { detectorId: 4 } },
            { user: { externalUserId: 1, roles: ['admin'] } }, // Create bad flag
        );

        await reloadPage(page);
        await expectLink(page, 'tr#row56 .column-ITS a', {
            href: 'http://localhost:4000/?page=qc-flags-for-simulation-pass&runNumber=56&dplDetectorId=4&simulationPassId=2',
            innerText: '0',
        });

        await page.waitForSelector('tr#row56 .column-ITS a .icon');

        await qcFlagService.delete(tmpQcFlag.id);
    });

    it('should successfully sort by runNumber in ascending and descending manners', async () => {
        await testTableSortingByColumn(page, 'runNumber');
    });

    it('Should display the correct items counter at the bottom of the page', async () => {
        await expectInnerText(page, '#firstRowIndex', '1');
        await expectInnerText(page, '#lastRowIndex', '3');
        await expectInnerText(page, '#totalRowsCount', '3');
    });

    it('successfully switch to raw timestamp display', async () => {
        await expectInnerText(page, '#row56 td:nth-child(3)', '08/08/2019\n20:00:00');
        await expectInnerText(page, '#row56 td:nth-child(4)', '08/08/2019\n21:00:00');

        await pressElement(page, '#preferences-raw-timestamps', true);
        await expectInnerText(page, '#row56 td:nth-child(3)', '1565294400000');
        await expectInnerText(page, '#row56 td:nth-child(4)', '1565298000000');
    });

    it('can set how many runs are available per page', async () => {
        const amountSelectorId = '#amountSelector';
        const amountSelectorButtonSelector = `${amountSelectorId} button`;
        await pressElement(page, amountSelectorButtonSelector);

        await page.waitForSelector(`${amountSelectorId} .dropup-menu`);

        const amountItems5 = `${amountSelectorId} .dropup-menu .menu-item:first-child`;
        await pressElement(page, amountItems5);

        await fillInput(page, `${amountSelectorId} input[type=number]`, 1111);
        await page.waitForSelector(amountSelectorId);
    });

    it('notifies if table loading returned an error', async () => {
        // eslint-disable-next-line no-return-assign, no-undef
        await page.evaluate(() => model.runs.perSimulationPassOverviewModel.pagination.itemsPerPage = 200);

        // We expect there to be a fitting error message
        const expectedMessage = 'Invalid Attribute: "query.page.limit" must be less than or equal to 100';
        await expectInnerText(page, '.alert-danger', expectedMessage);
        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.runs.perSimulationPassOverviewModel.pagination.reset();
            // eslint-disable-next-line no-undef
            model.runs.perSimulationPassOverviewModel.pagination.notify();
        });
        await waitForTableLength(page, 3);
    });

    it('can navigate to a run detail page', async () => {
        await waitForNavigation(page, () => pressElement(page, 'tbody tr:first-of-type a'));
        expectUrlParams(page, { page: 'run-detail', runNumber: 56 });
        await waitForNavigation(page, () => page.goBack());
    });

    it('should successfully export runs', async () => {
        const EXPORT_RUNS_TRIGGER_SELECTOR = '#export-runs-trigger';

        const targetFileName = 'runs.json';

        // First export
        await pressElement(page, EXPORT_RUNS_TRIGGER_SELECTOR);
        await page.waitForSelector('#export-runs-modal');
        await page.waitForSelector('#send:disabled');
        await page.waitForSelector('.form-control');
        await page.select('.form-control', 'runQuality', 'runNumber');
        await page.waitForSelector('#send:enabled');
        await expectInnerText(page, '#send', 'Export');

        const downloadPath = await waitForDownload(page, () => pressElement(page, '#send'));

        // Check download
        const downloadFilesNames = fs.readdirSync(downloadPath);
        expect(downloadFilesNames.filter((name) => name == targetFileName)).to.be.lengthOf(1);
        const runs = JSON.parse(fs.readFileSync(path.resolve(downloadPath, targetFileName)));

        expect(runs).to.be.lengthOf(3);
        expect(runs).to.have.deep.all.members([
            { runNumber: 56, runQuality: 'good' },
            { runNumber: 54, runQuality: 'good' },
            { runNumber: 49, runQuality: 'good' },
        ]);
        fs.unlinkSync(path.resolve(downloadPath, targetFileName));
    });
};
