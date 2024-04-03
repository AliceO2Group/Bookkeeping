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
    validateElement,
    getInnerText,
    checkMismatchingUrlParam,
} = require('../defaults');
const { RUN_QUALITIES } = require('../../../lib/domain/enums/RunQualities.js');
const { waitForDownload } = require('../../utilities/waitForDownload');

const { expect } = chai;
const dateAndTime = require('date-and-time');

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
        await goToPage(page, 'runs-per-simulation-pass', { queryParameters: { simulationPassId: 2 } });
        // eslint-disable-next-line require-jsdoc
        const validateDate = (date) => date === '-' || !isNaN(dateAndTime.parse(date, 'DD/MM/YYYY hh:mm:ss'));
        const tableDataValidators = {
            runNumber: (number) => !isNaN(number),
            fillNumber: (number) => number === '-' || !isNaN(number),

            timeO2Start: validateDate,
            timeO2End: validateDate,
            timeTrgStart: validateDate,
            timeTrgEnd: validateDate,

            aliceL3Current: (current) => !isNaN(Number(current)),
            aliceL3Dipole: (current) => !isNaN(Number(current)),
            ...Object.fromEntries(DETECTORS.map((detectorName) => [detectorName, (quality) => expect(quality).oneOf([...RUN_QUALITIES, ''])])),
        };

        await validateTableData(page, new Map(Object.entries(tableDataValidators)));
    });

    it('Should display the correct items counter at the bottom of the page', async () => {
        await goToPage(page, 'runs-per-simulation-pass', { queryParameters: { simulationPassId: 2 } });

        await expectInnerText(page, '#firstRowIndex', '1');
        await expectInnerText(page, '#lastRowIndex', '3');
        await expectInnerText(page, '#totalRowsCount', '3');
    });

    it('successfully switch to raw timestamp display', async () => {
        await goToPage(page, 'runs-per-simulation-pass', { queryParameters: { simulationPassId: 2 } });

        await expectInnerText(page, '#row56 td:nth-child(3)', '08/08/2019\n20:00:00');
        await expectInnerText(page, '#row56 td:nth-child(4)', '08/08/2019\n21:00:00');
        await pressElement(page, '#preferences-raw-timestamps');
        await expectInnerText(page, '#row56 td:nth-child(3)', '1565294400000');
        await expectInnerText(page, '#row56 td:nth-child(4)', '1565298000000');
    });

    it('can set how many runs are available per page', async () => {
        await goToPage(page, 'runs-per-simulation-pass', { queryParameters: { simulationPassId: 2 } });

        const amountSelectorId = '#amountSelector';
        const amountSelectorButtonSelector = `${amountSelectorId} button`;
        await pressElement(page, amountSelectorButtonSelector);

        await validateElement(page, `${amountSelectorId} .dropup-menu`);

        const amountItems5 = `${amountSelectorId} .dropup-menu .menu-item:first-child`;
        await pressElement(page, amountItems5);

        // Expect the custom per page input to have red border and text color if wrong value typed
        // const customPerPageInput = await page.$(`${amountSelectorId} input[type=number]`);
        // await customPerPageInput.evaluate((input) => input.focus());
        // await page.$eval(`${amountSelectorId} input[type=number]`, (el) => {
        //     el.value = '1111';
        //     el.dispatchEvent(new Event('input'));
        // });

        await fillInput(page, `${amountSelectorId} input[type=number]`, 1111);
        await validateElement(page, amountSelectorId);
    });

    it('notifies if table loading returned an error', async () => {
        await goToPage(page, 'runs-per-simulation-pass', { queryParameters: { simulationPassId: 2 } });

        // eslint-disable-next-line no-return-assign, no-undef
        await page.evaluate(() => model.runs.perSimulationPassOverviewModel.pagination.itemsPerPage = 200);

        // We expect there to be a fitting error message
        const expectedMessage = 'Invalid Attribute: "query.page.limit" must be less than or equal to 100';
        await expectInnerText(page, '.alert-danger', expectedMessage);
    });

    it('can navigate to a run detail page', async () => {
        await goToPage(page, 'runs-per-simulation-pass', { queryParameters: { simulationPassId: 2 } });

        const runNumberLinkCellSelector = 'tbody tr:first-of-type a';
        const expectedRunNumber = await getInnerText(await page.$(runNumberLinkCellSelector));

        await pressElement(page, runNumberLinkCellSelector);

        expect(await checkMismatchingUrlParam(page, { page: 'run-detail', runNumber: expectedRunNumber }))
            .to.be.eql({});
    });

    it('should successfully export runs', async () => {
        await goToPage(page, 'runs-per-simulation-pass', { queryParameters: { simulationPassId: 2 } });

        const EXPORT_RUNS_TRIGGER_SELECTOR = '#export-runs-trigger';

        const downloadPath = path.resolve('./download');

        // Check accessibility on frontend
        const session = await page.target().createCDPSession();
        await session.send('Browser.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath: downloadPath,
            eventsEnabled: true,
        });

        const targetFileName = 'runs.json';

        // First export
        await pressElement(page, EXPORT_RUNS_TRIGGER_SELECTOR);
        await validateElement(page, '#export-runs-modal');
        await validateElement(page, '#send:disabled');
        await validateElement(page, '.form-control');
        await page.select('.form-control', 'runQuality', 'runNumber');
        await validateElement(page, '#send:enabled');
        await expectInnerText(page, '#send', 'Export');

        await pressElement(page, '#send');
        await waitForDownload(session);

        // Check download
        const downloadFilesNames = fs.readdirSync(downloadPath);
        expect(downloadFilesNames.filter((name) => name == targetFileName)).to.be.lengthOf(1);
        const runs = JSON.parse(fs.readFileSync(path.resolve(downloadPath, targetFileName)));

        expect(runs).to.be.lengthOf(3);
        expect(runs).to.have.deep.all.members([
            { runNumber: 56, runQuality: 'good' },
            { runNumber: 54, runQuality: 'good' },
            { runNumber: 49, runQuality: 'good' },
        ]),
        fs.unlinkSync(path.resolve(downloadPath, targetFileName));
    });
};
