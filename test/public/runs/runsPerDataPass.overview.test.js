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
    expectColumnValues,
    fillInput,
    validateTableData,
    expectLink,
    validateDate,
} = require('../defaults');
const { waitForDownload } = require('../../utilities/waitForDownload');
const { waitForTimeout } = require('../defaults.js');
const { qcFlagService } = require('../../../lib/server/services/qualityControlFlag/QcFlagService');
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
        const response = await goToPage(page, 'runs-per-data-pass', { queryParameters: { dataPassId: 3 } });

        // We expect the page to return the correct status code, making sure the server is running properly
        expect(response.status()).to.equal(200);

        // We expect the page to return the correct title, making sure there isn't another server running on this port
        const title = await page.title();
        expect(title).to.equal('AliceO2 Bookkeeping');

        await page.waitForSelector('h2');
        const viewTitleElements = await Promise.all((await page.$$('h2')).map((element) => element.evaluate(({ innerText }) => innerText)));
        expect(viewTitleElements).to.have.all.ordered.members(['Physics Runs', 'LHC22a_apass1']);
    });

    it('shows correct datatypes in respective columns', async () => {
        await goToPage(page, 'runs-per-data-pass', { queryParameters: { dataPassId: 3 } });
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
            ...Object.fromEntries(DETECTORS.map((detectorName) => [
                detectorName,
                (qualityDisplay) => !qualityDisplay || /(QC)|(\d+!?)/.test(qualityDisplay),
            ])),
        };

        await validateTableData(page, new Map(Object.entries(tableDataValidators)));
        await expectLink(page, 'tr#row105 .column-CPV a', {
            href: 'http://localhost:4000/?page=qc-flag-creation-for-data-pass&runNumber=105&dplDetectorId=1&dataPassId=3',
            innerText: 'QC',
        });

        const [tmpQcFlag] = await qcFlagService.create(
            [{ flagTypeId: 3 }],
            { runNumber: 105, dataPassIdentifier: { id: 3 }, dplDetectorIdentifier: { dplDetectorId: 1 } },
            { userIdentifier: { externalUserId: 1 } }, // Create good flag
        );

        await reloadPage(page);
        await expectLink(page, 'tr#row105 .column-CPV a', {
            href: 'http://localhost:4000/?page=qc-flags-for-data-pass&runNumber=105&dplDetectorId=1&dataPassId=3',
            innerText: '100!',
        });

        await qcFlagService.delete(tmpQcFlag.id);
    });

    it('Should display the correct items counter at the bottom of the page', async () => {
        await reloadPage(page);

        expect(await page.$eval('#firstRowIndex', (element) => parseInt(element.innerText, 10))).to.equal(1);
        expect(await page.$eval('#lastRowIndex', (element) => parseInt(element.innerText, 10))).to.equal(4);
        expect(await page.$eval('#totalRowsCount', (element) => parseInt(element.innerText, 10))).to.equal(4);
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
        expect(tableRows.length - 1).to.equal(4);

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
        await page.evaluate(() => model.runs.perDataPassOverviewModel.pagination.itemsPerPage = 200);
        await waitForTimeout(100);

        // We expect there to be a fitting error message
        const expectedMessage = 'Invalid Attribute: "query.page.limit" must be less than or equal to 100';
        await expectInnerText(page, '.alert-danger', expectedMessage);

        // Revert changes for next test
        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.runs.perDataPassOverviewModel.pagination.itemsPerPage = 10;
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

    it('should successfully export runs', async () => {
        await goToPage(page, 'runs-per-data-pass', { queryParameters: { dataPassId: 3 } });
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
        await page.$eval(EXPORT_RUNS_TRIGGER_SELECTOR, (button) => button.click());
        await page.waitForSelector('#export-runs-modal');
        await page.waitForSelector('#send:disabled');
        await page.waitForSelector('.form-control');
        await page.select('.form-control', 'runQuality', 'runNumber');
        await page.waitForSelector('#send:enabled');
        const exportButtonText = await page.$eval('#send', (button) => button.innerText);
        expect(exportButtonText).to.be.eql('Export');

        await page.$eval('#send', (button) => button.click());

        await waitForDownload(session);

        // Check download
        const downloadFilesNames = fs.readdirSync(downloadPath);
        expect(downloadFilesNames.filter((name) => name == targetFileName)).to.be.lengthOf(1);
        const runs = JSON.parse(fs.readFileSync(path.resolve(downloadPath, targetFileName)));

        expect(runs).to.be.lengthOf(4);
        expect(runs).to.have.deep.all.members([
            { runNumber: 105, runQuality: 'test' },
            { runNumber: 56, runQuality: 'good' },
            { runNumber: 54, runQuality: 'good' },
            { runNumber: 49, runQuality: 'good' },
        ]);
        fs.unlinkSync(path.resolve(downloadPath, targetFileName));
    });

    // Filters
    it('should successfuly apply runNumber filter', async () => {
        await goToPage(page, 'runs-per-data-pass', { queryParameters: { dataPassId: 1 } });
        await pressElement(page, '#openFilterToggle');

        await fillInput(page, '.runNumber-filter input[type=text]', '108,107');
        await expectColumnValues(page, 'runNumber', ['108', '107']);

        await pressElement(page, '#reset-filters');
        await expectColumnValues(page, 'runNumber', ['108', '107', '106']);
    });

    it('should successfuly apply detectors filter', async () => {
        await goToPage(page, 'runs-per-data-pass', { queryParameters: { dataPassId: 2 } });
        await pressElement(page, '#openFilterToggle');

        await pressElement(page, '.detectors-filter .dropdown-trigger');
        await pressElement(page, '#detector-filter-dropdown-option-CPV');
        await expectColumnValues(page, 'runNumber', ['2', '1']);

        await pressElement(page, '#reset-filters');
        await expectColumnValues(page, 'runNumber', ['55', '2', '1']);
    });

    it('should successfuly apply tags filter', async () => {
        await goToPage(page, 'runs-per-data-pass', { queryParameters: { dataPassId: 1 } });
        await pressElement(page, '#openFilterToggle');

        await pressElement(page, '.tags-filter .dropdown-trigger');

        await fillInput(page, '#tag-dropdown-search-input', 'FOOD');
        await pressElement(page, '#tag-dropdown-option-FOOD');

        await fillInput(page, '#tag-dropdown-search-input', 'RUN');
        await pressElement(page, '#tag-dropdown-option-RUN');

        await expectColumnValues(page, 'runNumber', ['106']);

        await pressElement(page, '#reset-filters');
        await expectColumnValues(page, 'runNumber', ['108', '107', '106']);
    });

    it('should successfuly apply timeStart filter', async () => {
        await goToPage(page, 'runs-per-data-pass', { queryParameters: { dataPassId: 2 } });
        await pressElement(page, '#openFilterToggle');

        await fillInput(page, '.timeO2Start-filter input[type=date]', '2021-01-01');
        await expectColumnValues(page, 'runNumber', ['1']);

        await pressElement(page, '#reset-filters');
        await expectColumnValues(page, 'runNumber', ['55', '2', '1']);
    });

    it('should successfuly apply timeEnd filter', async () => {
        await goToPage(page, 'runs-per-data-pass', { queryParameters: { dataPassId: 2 } });
        await pressElement(page, '#openFilterToggle');

        await fillInput(page, '.timeO2End-filter input[type=date]', '2021-01-01');
        await expectColumnValues(page, 'runNumber', ['1']);

        await pressElement(page, '#reset-filters');
        await expectColumnValues(page, 'runNumber', ['55', '2', '1']);
    });

    it('should successfuly apply duration filter', async () => {
        await goToPage(page, 'runs-per-data-pass', { queryParameters: { dataPassId: 2 } });
        await pressElement(page, '#openFilterToggle');

        await page.select('.runDuration-filter select', '>=');

        /**
         * Invokation of page.select and fillInput in case of amountFilter results in two concurrent,
         * async actions whereas a result of only one of them is saved into model.
         * Therefore additional action is invoked in between
         */
        await page.select('.runDuration-filter select', '>=');
        await pressElement(page, '#openFilterToggle');
        await pressElement(page, '#openFilterToggle');
        await fillInput(page, '.runDuration-filter input[type=number]', '10');

        await expectColumnValues(page, 'runNumber', ['55', '1']);

        await pressElement(page, '#reset-filters');
        await expectColumnValues(page, 'runNumber', ['55', '2', '1']);
    });
};
