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
    validateDate,
    waitForTableLength,
    waitForNavigation,
    waitForDownload,
    testTableSortingByColumn,
    getInnerText,
    expectUrlParams,
    fillInput,
    expectColumnValues,
} = require('../defaults.js');
const { RUN_QUALITIES, RunQualities } = require('../../../lib/domain/enums/RunQualities.js');
const { resetDatabaseContent } = require('../../utilities/resetDatabaseContent.js');
const { RunDefinition } = require('../../../lib/domain/enums/RunDefinition.js');

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
        const response = await goToPage(page, 'runs-per-lhc-period', { queryParameters: { lhcPeriodId: 1 } });

        expect(response.status()).to.equal(200);

        const title = await page.title();
        expect(title).to.equal('AliceO2 Bookkeeping');
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
        };

        // By default current tab is 'detectorsQualities'
        const tableDataValidatorsWithDetectorQualities = {
            ...tableDataValidators,
            ...Object.fromEntries(DETECTORS.map((detectorName) => [detectorName, (quality) => expect(quality).oneOf([...RUN_QUALITIES, ''])])),
        };

        await validateTableData(page, new Map(Object.entries(tableDataValidatorsWithDetectorQualities)));

        await waitForNavigation(page, () => pressElement(page, '#synchronousFlags-tab'));

        const tableDataValidatorsWithQualityFromSynchronousFlags = {
            ...tableDataValidators,
            ...Object.fromEntries(DETECTORS.map((detectorName) => [
                detectorName,
                (notBadDataFraction) => !notBadDataFraction || !isNaN(Number(notBadDataFraction)),
            ])),
        };

        await validateTableData(page, new Map(Object.entries(tableDataValidatorsWithQualityFromSynchronousFlags)));
        await expectInnerText(page, '#row56-FT0', '83');
    });

    it('should successfully sort by runNumber in ascending and descending manners', async () => {
        await testTableSortingByColumn(page, 'runNumber');
    });

    it('Should display the correct items counter at the bottom of the page', async () => {
        await expectInnerText(page, '#firstRowIndex', '1');
        await expectInnerText(page, '#lastRowIndex', '4');
        await expectInnerText(page, '#totalRowsCount', '4');
    });

    it('successfully switch to raw timestamp display', async () => {
        await expectInnerText(page, '#row56 td:nth-child(3)', '08/08/2019\n20:00:00');
        await expectInnerText(page, '#row56 td:nth-child(4)', '08/08/2019\n21:00:00');

        await pressElement(page, '#preferences-raw-timestamps', true);
        await expectInnerText(page, '#row56 td:nth-child(3)', '1565294400000');
        await expectInnerText(page, '#row56 td:nth-child(4)', '1565298000000');

        // Go back to normal
        await pressElement(page, '#preferences-raw-timestamps', true);
    });

    it('can set how many runs are available per page', async () => {
        const amountSelectorId = '#amountSelector';
        const amountSelectorButtonSelector = `${amountSelectorId} button`;
        await pressElement(page, amountSelectorButtonSelector);

        await page.waitForSelector(`${amountSelectorId} .dropup-menu`);

        const amountItems5 = `${amountSelectorId} .dropup-menu .menu-item:first-child`;
        await pressElement(page, amountItems5, true);
        await waitForTableLength(page, 4);
        await expectInnerText(page, '.dropup button', 'Rows per page: 5 ');

        // Expect the custom per page input to have red border and text color if wrong value typed
        await fillInput(page, `${amountSelectorId} input[type=number]`, '1111');
        await page.waitForSelector(`${amountSelectorId} input:invalid`);
        await fillInput(page, `${amountSelectorId} input[type=number]`, '');
    });

    it('notifies if table loading returned an error', async () => {
        // eslint-disable-next-line no-return-assign, no-undef
        await page.evaluate(() => model.runs.perLhcPeriodOverviewModel.pagination.itemsPerPage = 200);
        await page.waitForSelector('.alert-danger');

        // We expect there to be a fitting error message
        const expectedMessage = 'Invalid Attribute: "query.page.limit" must be less than or equal to 100';
        await expectInnerText(page, '.alert-danger', expectedMessage);

        // Revert changes for next test
        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.runs.perLhcPeriodOverviewModel.pagination.itemsPerPage = 10;
        });
        await waitForTableLength(page, 4);
    });

    const EXPORT_RUNS_TRIGGER_SELECTOR = '#export-data-trigger';

    it('should successfully export all runs per lhc Period', async () => {
        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.runs.perLhcPeriodOverviewModel.pagination.itemsPerPage = 2;
        });

        const targetFileName = 'data.json';

        // First export
        await pressElement(page, EXPORT_RUNS_TRIGGER_SELECTOR, true);
        await page.waitForSelector('select.form-control', { timeout: 200 });
        await page.select('select.form-control', 'runQuality', 'runNumber', 'definition', 'lhcPeriod');
        await expectInnerText(page, '#send:enabled', 'Export');

        const downloadPath = await waitForDownload(page, () => pressElement(page, '#send:enabled'));

        // Check download
        const downloadFilesNames = fs.readdirSync(downloadPath);
        expect(downloadFilesNames.filter((name) => name == targetFileName)).to.be.lengthOf(1);
        const runs = JSON.parse(fs.readFileSync(path.resolve(downloadPath, targetFileName)));

        expect(runs).to.have.all.deep.members([
            {
                runNumber: 105,
                lhcPeriod: 'LHC22a',
                runQuality: RunQualities.GOOD,
                definition: RunDefinition.PHYSICS,
            },
            {
                runNumber: 49,
                runQuality: RunQualities.GOOD,
                definition: RunDefinition.PHYSICS,
                lhcPeriod: 'LHC22a',
            },
            {
                runNumber: 54,
                runQuality: RunQualities.GOOD,
                definition: RunDefinition.PHYSICS,
                lhcPeriod: 'LHC22a',
            },
            {
                runNumber: 56,
                runQuality: RunQualities.GOOD,
                definition: RunDefinition.PHYSICS,
                lhcPeriod: 'LHC22a',
            },
        ]);

        fs.unlinkSync(path.resolve(downloadPath, targetFileName));
    });

    it('can navigate to a run detail page', async () => {
        const expectedRunNumber = await getInnerText(await page.waitForSelector('tbody tr:first-of-type a'));
        await waitForNavigation(page, () => pressElement(page, 'tbody tr:first-of-type a'));
        expectUrlParams(page, { page: 'run-detail', runNumber: expectedRunNumber });
        await page.goBack()
    });

    it('should successfully apply detectors notBadFraction filters', async () => {
        await pressElement(page, '#openFilterToggle', true);

        await page.waitForSelector('#inelasticInteractionRateAvg-operator');
        await page.select('#inelasticInteractionRateAvg-operator', '<=');
        await fillInput(page, '#inelasticInteractionRateAvg-operand', '100000', ['change']);
        await expectColumnValues(page, 'runNumber', ['56', '54']);

        await pressElement(page, '#openFilterToggle', true);
        await pressElement(page, '#reset-filters', true);
        await expectColumnValues(page, 'runNumber', ['105', '56', '54', '49']);
    });
};
