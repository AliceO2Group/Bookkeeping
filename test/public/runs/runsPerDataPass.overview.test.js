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
    expectColumnValues,
    fillInput,
    validateTableData,
    expectLink,
    validateDate,
    waitForTableLength,
    waitForNavigation,
    waitForDownload,
    getPopoverContent,
    getPopoverSelector,
    getInnerText,
    expectUrlParams,
    getPopoverInnerText,
    testTableSortingByColumn,
} = require('../defaults.js');
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

/**
 * Navigate to Runs per Data Pass page
 *
 * @param {Puppeteer.page} page page
 * @param {number} params.lhcPeriodId id of lhc period on LHC Period overview page
 * @param {number} params.dataPassId id of data pass on Data Passes per LHC Period page
 * @return {Promise<void>} promise
 */
const navigateToRunsPerDataPass = async (page, { lhcPeriodId, dataPassId }) => {
    await waitForNavigation(page, () => pressElement(page, 'a#lhc-period-overview', true));
    const pdpBeamType = await getInnerText(await page.waitForSelector(`#row${lhcPeriodId}-beamTypes`));
    await waitForNavigation(page, () => pressElement(page, `#row${lhcPeriodId}-associatedDataPasses a`, true));
    expectUrlParams(page, { page: 'data-passes-per-lhc-period-overview', lhcPeriodId });
    await page.waitForSelector('th#description');
    await waitForNavigation(page, () => pressElement(page, `#row${dataPassId}-associatedRuns a`, true));
    expectUrlParams(page, { page: 'runs-per-data-pass', dataPassId, pdpBeamType });
};

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
        const response = await goToPage(page, 'runs-per-data-pass', { queryParameters: { dataPassId: 1 } });

        // We expect the page to return the correct status code, making sure the server is running properly
        expect(response.status()).to.equal(200);

        // We expect the page to return the correct title, making sure there isn't another server running on this port
        const title = await page.title();
        expect(title).to.equal('AliceO2 Bookkeeping');

        await page.waitForSelector('h2');
        const viewTitleElements = await Promise.all((await page.$$('h2')).map((element) => element.evaluate(({ innerText }) => innerText)));
        expect(viewTitleElements).to.have.all.ordered.members(['Physics Runs', 'LHC22b_apass1']);
    });

    it('shows correct datatypes in respective columns', async () => {
        const commonColumnsValidators = {
            runNumber: (number) => !isNaN(number),
            fillNumber: (number) => number === '-' || !isNaN(number),

            timeO2Start: (date) => date === '-' || validateDate(date),
            timeO2End: (date) => date === '-' || validateDate(date),
            timeTrgStart: (date) => date === '-' || validateDate(date),
            timeTrgEnd: (date) => date === '-' || validateDate(date),

            aliceL3Current: (current) => !isNaN(Number(current.replace(/,/g, ''))),
            dipoleCurrent: (current) => !isNaN(Number(current.replace(/,/g, ''))),
            ...Object.fromEntries(DETECTORS.map((detectorName) => [
                detectorName,
                (qualityDisplay) => !qualityDisplay || /(QC)|(\d+(\nMC\.R)?)/.test(qualityDisplay),
            ])),
        };

        await navigateToRunsPerDataPass(page, { lhcPeriodId: 1, dataPassId: 3 });
        // Expectations of header texts being of a certain datatype
        let tableDataValidators = {
            ...commonColumnsValidators,
            inelasticInteractionRateAvg: (value) => value === '-' || !isNaN(Number(value.replace(/,/g, ''))),
            inelasticInteractionRateAtStart: (value) => value === '-' || !isNaN(Number(value.replace(/,/g, ''))),
            inelasticInteractionRateAtMid: (value) => value === '-' || !isNaN(Number(value.replace(/,/g, ''))),
            inelasticInteractionRateAtEnd: (value) => value === '-' || !isNaN(Number(value.replace(/,/g, ''))),
        };

        await validateTableData(page, new Map(Object.entries(tableDataValidators)));

        await navigateToRunsPerDataPass(page, { lhcPeriodId: 2, dataPassId: 1 });
        // Expectations of header texts being of a certain datatype
        tableDataValidators = {
            muInelasticInteractionRate: (value) => value === '-' || !isNaN(Number(value.replace(/,/g, ''))),
            inelasticInteractionRateAvg: (value) => value === '-' || !isNaN(Number(value.replace(/,/g, ''))),
        };
        await validateTableData(page, new Map(Object.entries(tableDataValidators)));

        await expectLink(page, 'tr#row106 .column-EMC a', {
            href: 'http://localhost:4000/?page=qc-flag-creation-for-data-pass&runNumber=106&dplDetectorId=2&dataPassId=1',
            innerText: 'QC',
        });

        await expectLink(page, 'tr#row106 .column-CPV a', {
            href: 'http://localhost:4000/?page=qc-flags-for-data-pass&runNumber=106&dplDetectorId=1&dataPassId=1',
            innerText: '67MC.R',
        });
        await page.waitForSelector('tr#row106 .column-CPV a .icon');

        await expectInnerText(page, '#row106-globalAggregatedQuality', '67MC.R');
        expect(await getPopoverInnerText(await page.waitForSelector('#row106-globalAggregatedQuality .popover-trigger')))
            .to.be.equal('Missing 3 verifications');
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
        await navigateToRunsPerDataPass(page, { lhcPeriodId: 1, dataPassId: 3 });

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

        const amountSelectorDropdown = await page.$(`${amountSelectorId} .dropup-menu`);
        expect(Boolean(amountSelectorDropdown)).to.be.true;

        const amountItems5 = `${amountSelectorId} .dropup-menu .menu-item:first-child`;
        await pressElement(page, amountItems5);

        // Expect the amount of visible runs to reduce when the first option (5) is selected
        await expectInnerText(page, '.dropup button', 'Rows per page: 5 ');
        await waitForTableLength(page, 4);

        // Expect the custom per page input to have red border and text color if wrong value typed
        const customPerPageInput = await page.$(`${amountSelectorId} input[type=number]`);
        await customPerPageInput.evaluate((input) => input.focus());
        await page.$eval(`${amountSelectorId} input[type=number]`, (el) => {
            el.value = '1111';
            el.dispatchEvent(new Event('input'));
        });
        await page.waitForSelector(`${amountSelectorId} input:invalid`);
        await page.evaluate(() => {
            // eslint-disable-next-line no-return-assign, no-undef
            model.runs.perDataPassOverviewModel.pagination.reset();
            // eslint-disable-next-line no-return-assign, no-undef
            model.runs.perDataPassOverviewModel.notify();
        });
    });

    it('notifies if table loading returned an error', async () => {
        // eslint-disable-next-line no-return-assign, no-undef
        await page.evaluate(() => model.runs.perDataPassOverviewModel.pagination.itemsPerPage = 200);
        await page.waitForSelector('.alert-danger');

        // We expect there to be a fitting error message
        const expectedMessage = 'Invalid Attribute: "query.page.limit" must be less than or equal to 100';
        await expectInnerText(page, '.alert-danger', expectedMessage);

        // Revert changes for next test
        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.runs.perDataPassOverviewModel.pagination.reset();
            // eslint-disable-next-line no-undef
            model.runs.perDataPassOverviewModel.notify();
        });
        await waitForTableLength(page, 4);
    });

    it('can navigate to a run detail page', async () => {
        await page.waitForSelector('tbody tr');
        const expectedRunNumber = await getInnerText(await page.waitForSelector('tbody tr:first-of-type a'));

        await waitForNavigation(page, async () => await pressElement(page, 'tbody tr:first-of-type a'));
        const redirectedUrl = await page.url();

        const urlParameters = redirectedUrl.slice(redirectedUrl.indexOf('?') + 1).split('&');

        expect(urlParameters).to.contain('page=run-detail');
        expect(urlParameters).to.contain(`runNumber=${expectedRunNumber}`);
    });

    it('should successfully export runs', async () => {
        await navigateToRunsPerDataPass(page, { lhcPeriodId: 1, dataPassId: 3 });

        const targetFileName = 'runs.json';

        // First export
        await pressElement(page, '#export-runs-trigger');
        await page.waitForSelector('#export-runs-modal');
        await page.waitForSelector('#send:disabled');
        await page.waitForSelector('.form-control');
        await page.select('.form-control', 'runQuality', 'runNumber');
        await page.waitForSelector('#send:enabled');
        const exportButtonText = await page.$eval('#send', (button) => button.innerText);
        expect(exportButtonText).to.be.eql('Export');

        const downloadPath = await waitForDownload(page, () => pressElement(page, '#send', true));

        // Check download
        const downloadFilesNames = fs.readdirSync(downloadPath);
        expect(downloadFilesNames.filter((name) => name == targetFileName)).to.be.lengthOf(1);
        const runs = JSON.parse(fs.readFileSync(path.resolve(downloadPath, targetFileName)));

        expect(runs).to.be.lengthOf(4);
        expect(runs).to.have.deep.all.members([
            { runNumber: 105, runQuality: 'good' },
            { runNumber: 56, runQuality: 'good' },
            { runNumber: 54, runQuality: 'good' },
            { runNumber: 49, runQuality: 'good' },
        ]);
        fs.unlinkSync(path.resolve(downloadPath, targetFileName));
    });

    // Filters
    it('should successfully apply runNumber filter', async () => {
        await navigateToRunsPerDataPass(page, { lhcPeriodId: 2, dataPassId: 1 });

        await pressElement(page, '#openFilterToggle');

        await fillInput(page, '.runNumber-filter input[type=text]', '108,107');
        await expectColumnValues(page, 'runNumber', ['108', '107']);

        await pressElement(page, '#reset-filters');
        await expectColumnValues(page, 'runNumber', ['108', '107', '106']);
    });

    it('should successfully apply detectors filter', async () => {
        await navigateToRunsPerDataPass(page, { lhcPeriodId: 2, dataPassId: 2 });

        await pressElement(page, '#openFilterToggle');

        await pressElement(page, '.detectors-filter .dropdown-trigger');
        await pressElement(page, '#detector-filter-dropdown-option-CPV', true);
        await expectColumnValues(page, 'runNumber', ['2', '1']);

        await pressElement(page, '#reset-filters');
        await expectColumnValues(page, 'runNumber', ['55', '2', '1']);
    });

    it('should successfully apply tags filter', async () => {
        await navigateToRunsPerDataPass(page, { lhcPeriodId: 2, dataPassId: 1 });
        await pressElement(page, '#openFilterToggle');

        await pressElement(page, '.tags-filter .dropdown-trigger');

        await pressElement(page, '#tag-dropdown-option-FOOD', true);
        await pressElement(page, '#tag-dropdown-option-RUN', true);

        await expectColumnValues(page, 'runNumber', ['106']);

        await pressElement(page, '#reset-filters');
        await expectColumnValues(page, 'runNumber', ['108', '107', '106']);
    });

    it('should successfully apply timeStart filter', async () => {
        await navigateToRunsPerDataPass(page, { lhcPeriodId: 2, dataPassId: 2 });
        await pressElement(page, '#openFilterToggle');

        await fillInput(page, '.timeO2Start-filter input[type=date]', '2021-01-01');
        await expectColumnValues(page, 'runNumber', ['1']);

        await pressElement(page, '#reset-filters');
        await expectColumnValues(page, 'runNumber', ['55', '2', '1']);
    });

    it('should successfully apply timeEnd filter', async () => {
        await pressElement(page, '#openFilterToggle');

        await fillInput(page, '.timeO2End-filter input[type=date]', '2021-01-01');
        await expectColumnValues(page, 'runNumber', ['1']);

        await pressElement(page, '#reset-filters', true);
        await expectColumnValues(page, 'runNumber', ['55', '2', '1']);
    });

    it('should successfully apply duration filter', async () => {
        await pressElement(page, '#openFilterToggle');

        await page.select('.runDuration-filter select', '>=');

        /**
         * Invocation of page.select and fillInput in case of amountFilter results in two concurrent,
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

    it('should successfully apply alice currents filters', async () => {
        await navigateToRunsPerDataPass(page, { lhcPeriodId: 1, dataPassId: 3 });
        await pressElement(page, '#openFilterToggle');

        const popoverSelector = await getPopoverSelector(await page.waitForSelector('.aliceL3AndDipoleCurrent-filter .popover-trigger'));
        await pressElement(page, `${popoverSelector} .dropdown-option:last-child`, true); // Select 30003kA/0kA

        await expectColumnValues(page, 'runNumber', ['54']);

        await pressElement(page, '#reset-filters');
        await expectColumnValues(page, 'runNumber', ['105', '56', '54', '49']);
    });

    const inelasticInteractionRateFilteringTestsParameters = {
        inelasticInteractionRateAvg: { operator: 'le', value: 50000, expectedRuns: ['56', '54'] },
        inelasticInteractionRateAtStart: { operator: 'gt', value: 20000, expectedRuns: ['56'] },
        inelasticInteractionRateAtMid: { operator: 'lt', value: 30000, expectedRuns: ['54'] },
        inelasticInteractionRateAtEnd: { operator: 'gt', value: 40000, expectedRuns: ['56'] },
    };

    for (const [property, testParameters] of Object.entries(inelasticInteractionRateFilteringTestsParameters)) {
        const { operator, value, expectedRuns } = testParameters;
        it(`should successfully apply ${property} filters`, async () => {
            await pressElement(page, '#openFilterToggle');

            const popoverSelector = await getPopoverSelector(await page.waitForSelector(`.${property}-filter .popover-trigger`));
            await pressElement(page, `${popoverSelector} #${property}-dropdown-option-${operator}`, true);
            await fillInput(page, `#${property}-value-input`, value);
            await expectColumnValues(page, 'runNumber', expectedRuns);

            await pressElement(page, '#reset-filters', true);
            await expectColumnValues(page, 'runNumber', ['105', '56', '54', '49']);
        });
    }

    it('should successfully apply muInelasticInteractionRate filters', async () => {
        await navigateToRunsPerDataPass(page, { lhcPeriodId: 2, dataPassId: 1 });
        await pressElement(page, '#openFilterToggle');

        const popoverSelector = await getPopoverSelector(await page.waitForSelector('.muInelasticInteractionRate-filter .popover-trigger'));
        await pressElement(page, `${popoverSelector} #muInelasticInteractionRate-dropdown-option-ge`, true);
        await fillInput(page, '#muInelasticInteractionRate-value-input', 0.03);
        await expectColumnValues(page, 'runNumber', ['106']);

        await pressElement(page, '#reset-filters', true);
        await expectColumnValues(page, 'runNumber', ['108', '107', '106']);
    });

    it('should display bad runs marked out', async () => {
        await navigateToRunsPerDataPass(page, { lhcPeriodId: 2, dataPassId: 2 });

        await page.waitForSelector('tr#row2.danger');
        await page.waitForSelector('tr#row2 .column-CPV .popover-trigger svg');
        const popoverSelector = await getPopoverSelector(await page.waitForSelector('tr#row2 .column-CPV .popover-trigger'));
        const popoverContent = await getPopoverContent(await page.$(popoverSelector));
        expect(popoverContent).to.be.equal('Quality of the run was changed to bad so it is no more subject to QC');
    });
};
