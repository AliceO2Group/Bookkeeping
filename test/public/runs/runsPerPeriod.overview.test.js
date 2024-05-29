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
    reloadPage,
    validateTableData,
    validateDate,
} = require('../defaults');
const { RUN_QUALITIES, RunQualities } = require('../../../lib/domain/enums/RunQualities.js');
const { waitForTimeout } = require('../defaults.js');
const { waitForDownload } = require('../../utilities/waitForDownload');
const { RunDefinition } = require('../../../lib/server/services/run/getRunDefinition');
const { resetDatabaseContent } = require('../../utilities/resetDatabaseContent.js');

const { expect } = chai;

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
        const response = await goToPage(page, 'runs-per-lhc-period', { queryParameters: { lhcPeriodName: 'LHC22a' } });

        // We expect the page to return the correct status code, making sure the server is running properly
        expect(response.status()).to.equal(200);

        // We expect the page to return the correct title, making sure there isn't another server running on this port
        const title = await page.title();
        expect(title).to.equal('AliceO2 Bookkeeping');
    });

    it('shows correct datatypes in respective columns', async () => {
        await goToPage(page, 'runs-per-lhc-period', { queryParameters: { lhcPeriodName: 'LHC22a' } });

        // Expectations of header texts being of a certain datatype
        const tableDataValidators = {
            runNumber: (number) => !isNaN(number),
            fillNumber: (number) => number === '-' || !isNaN(number),

            timeO2Start: (date) => date === '-' || validateDate(date),
            timeO2End: (date) => date === '-' || validateDate(date),
            timeTrgStart: (date) => date === '-' || validateDate(date),
            timeTrgEnd: (date) => date === '-' || validateDate(date),

            aliceL3Current: (current) => !isNaN(Number(current.replace(/,/g, ''))),
            dipoleCurrent: (current) => !isNaN(Number(current.replace(/,/g, ''))),

            muInelasticInteractionRate: (value) => value === '-' || !isNaN(Number(value.replace(/,/g, ''))),
            inelasticInteractionRateAvg: (value) => value === '-' || !isNaN(Number(value.replace(/,/g, ''))),
            inelasticInteractionRateAtStart: (value) => value === '-' || !isNaN(Number(value.replace(/,/g, ''))),
            inelasticInteractionRateAtMid: (value) => value === '-' || !isNaN(Number(value.replace(/,/g, ''))),
            inelasticInteractionRateAtEnd: (value) => value === '-' || !isNaN(Number(value.replace(/,/g, ''))),
            ...Object.fromEntries(DETECTORS.map((detectorName) => [detectorName, (quality) => expect(quality).oneOf([...RUN_QUALITIES, ''])])),
        };

        await validateTableData(page, new Map(Object.entries(tableDataValidators)));
    });

    it('Should display the correct items counter at the bottom of the page', async () => {
        await reloadPage(page);

        expect(await page.$eval('#firstRowIndex', (element) => parseInt(element.innerText, 10))).to.equal(1);
        expect(await page.$eval('#lastRowIndex', (element) => parseInt(element.innerText, 10))).to.equal(3);
        expect(await page.$eval('#totalRowsCount', (element) => parseInt(element.innerText, 10))).to.equal(3);
    });

    it('successfully switch to raw timestamp display', async () => {
        await reloadPage(page);
        const rawTimestampToggleSelector = '#preferences-raw-timestamps';
        expect(await page.evaluate(() => document.querySelector('#row56 td:nth-child(3)').innerText)).to.equal('08/08/2019\n20:00:00');
        expect(await page.evaluate(() => document.querySelector('#row56 td:nth-child(4)').innerText)).to.equal('08/08/2019\n21:00:00');
        await page.$eval(rawTimestampToggleSelector, (element) => element.click());
        expect(await page.evaluate(() => document.querySelector('#row56 td:nth-child(3)').innerText)).to.equal('1565294400000');
        expect(await page.evaluate(() => document.querySelector('#row56 td:nth-child(4)').innerText)).to.equal('1565298000000');
        // Go back to normal
        await page.$eval(rawTimestampToggleSelector, (element) => element.click());
    });

    it('can set how many runs are available per page', async () => {
        await reloadPage(page);

        const amountSelectorId = '#amountSelector';
        const amountSelectorButtonSelector = `${amountSelectorId} button`;
        await pressElement(page, amountSelectorButtonSelector);

        const amountSelectorDropdown = await page.$(`${amountSelectorId} .dropup-menu`);
        expect(Boolean(amountSelectorDropdown)).to.be.true;

        const amountItems5 = `${amountSelectorId} .dropup-menu .menu-item:first-child`;
        await pressElement(page, amountItems5);
        await waitForTimeout(600);

        // Expect the amount of visible runs to reduce when the first option (5) is selected
        const tableRows = await page.$$('table tr');
        expect(tableRows.length - 1).to.equal(3);

        // Expect the custom per page input to have red border and text color if wrong value typed
        const customPerPageInput = await page.$(`${amountSelectorId} input[type=number]`);
        await customPerPageInput.evaluate((input) => input.focus());
        await page.$eval(`${amountSelectorId} input[type=number]`, (el) => {
            el.value = '1111';
            el.dispatchEvent(new Event('input'));
        });
        await waitForTimeout(100);
        expect(Boolean(await page.$(`${amountSelectorId} input:invalid`))).to.be.true;
    });

    it('notifies if table loading returned an error', async () => {
        await reloadPage(page);
        await waitForTimeout(100);
        // eslint-disable-next-line no-return-assign, no-undef
        await page.evaluate(() => model.runs.perLhcPeriodOverviewModel.pagination.itemsPerPage = 200);
        await waitForTimeout(100);

        // We expect there to be a fitting error message
        const expectedMessage = 'Invalid Attribute: "query.page.limit" must be less than or equal to 100';
        await expectInnerText(page, '.alert-danger', expectedMessage);

        // Revert changes for next test
        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.runs.perLhcPeriodOverviewModel.pagination.itemsPerPage = 10;
        });
        await waitForTimeout(100);
    });

    it('can navigate to a run detail page', async () => {
        await reloadPage(page);
        await waitForTimeout(100);
        await page.waitForSelector('tbody tr');

        const expectedRunNumber = await page.evaluate(() => document.querySelector('tbody tr:first-of-type a').innerText);

        await page.evaluate(() => document.querySelector('tbody tr:first-of-type a').click());
        await waitForTimeout(100);
        const redirectedUrl = await page.url();

        const urlParameters = redirectedUrl.slice(redirectedUrl.indexOf('?') + 1).split('&');

        expect(urlParameters).to.contain('page=run-detail');
        expect(urlParameters).to.contain(`runNumber=${expectedRunNumber}`);
    });

    const EXPORT_RUNS_TRIGGER_SELECTOR = '#export-runs-trigger';

    it('should successfully export all runs per lhc Period', async () => {
        await goToPage(page, 'runs-per-lhc-period', { queryParameters: { lhcPeriodName: 'LHC22a' } });

        const downloadPath = path.resolve('./download');

        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.runs.perLhcPeriodOverviewModel.pagination.itemsPerPage = 2;
        });

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
        await page.waitForSelector('select.form-control', { timeout: 200 });
        await page.select('select.form-control', 'runQuality', 'runNumber', 'definition', 'lhcPeriod');
        await expectInnerText(page, '#send:enabled', 'Export');
        await Promise.all([
            waitForDownload(session),
            pressElement(page, '#send:enabled'),
        ]);

        // Check download
        const downloadFilesNames = fs.readdirSync(downloadPath);
        expect(downloadFilesNames.filter((name) => name == targetFileName)).to.be.lengthOf(1);
        const runs = JSON.parse(fs.readFileSync(path.resolve(downloadPath, targetFileName)));

        expect(runs).to.have.all.deep.members([
            {
                runNumber: 49,
                runQuality: RunQualities.GOOD,
                definition: RunDefinition.Physics,
                lhcPeriod: 'LHC22a',
            },
            {
                runNumber: 54,
                runQuality: RunQualities.GOOD,
                definition: RunDefinition.Physics,
                lhcPeriod: 'LHC22a',
            },
            {
                runNumber: 56,
                runQuality: RunQualities.GOOD,
                definition: RunDefinition.Physics,
                lhcPeriod: 'LHC22a',
            },
        ]);

        fs.unlinkSync(path.resolve(downloadPath, targetFileName));
    });
};
