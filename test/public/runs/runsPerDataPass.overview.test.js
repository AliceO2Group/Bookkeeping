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
    getPopoverInnerText,
    testTableSortingByColumn,
    setConfirmationDialogToBeAccepted,
    unsetConfirmationDialogActions,
    checkPopoverInnerText,
} = require('../defaults.js');
const { resetDatabaseContent } = require('../../utilities/resetDatabaseContent.js');
const DataPassRepository = require('../../../lib/database/repositories/DataPassRepository.js');
const { BkpRoles } = require('../../../lib/domain/enums/BkpRoles.js');
const { navigateToRunsPerDataPass } = require('./navigationUtils.js');

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

        await navigateToRunsPerDataPass(page, 1, 3, 4);
        // Expectations of header texts being of a certain datatype
        let tableDataValidators = {
            ...commonColumnsValidators,
            inelasticInteractionRateAvg: (value) => value === '-' || !isNaN(Number(value.replace(/,/g, ''))),
            inelasticInteractionRateAtStart: (value) => value === '-' || !isNaN(Number(value.replace(/,/g, ''))),
            inelasticInteractionRateAtMid: (value) => value === '-' || !isNaN(Number(value.replace(/,/g, ''))),
            inelasticInteractionRateAtEnd: (value) => value === '-' || !isNaN(Number(value.replace(/,/g, ''))),
        };

        await validateTableData(page, new Map(Object.entries(tableDataValidators)));

        await navigateToRunsPerDataPass(page, 2, 1, 3);
        // Expectations of header texts being of a certain datatype
        tableDataValidators = {
            muInelasticInteractionRate: (value) => value === '-' || !isNaN(Number(value.replace(/,/g, ''))),
            inelasticInteractionRateAvg: (value) => value === '-' || !isNaN(Number(value.replace(/,/g, ''))),
        };

        await validateTableData(page, new Map(Object.entries(tableDataValidators)));

        await expectLink(page, 'tr#row106 .column-EMC a', {
            href: 'http://localhost:4000/?page=qc-flag-creation-for-data-pass&runNumberDetectorsMap=106:2&dataPassId=1',
            innerText: 'QC',
        });

        await expectLink(page, 'tr#row106 .column-CPV a', {
            href: 'http://localhost:4000/?page=qc-flags-for-data-pass&runNumber=106&dplDetectorId=1&dataPassId=1',
            innerText: '67MC.R',
        });
        await page.waitForSelector('tr#row106 .column-CPV a .icon');

        await expectInnerText(page, '#row106-globalAggregatedQuality', 'GAQ');

        await expectInnerText(page, '#row107-globalAggregatedQuality', '76');
        expect(await getPopoverInnerText(await page.waitForSelector('#row107-globalAggregatedQuality .popover-trigger')))
            .to.be.equal('Missing 3 verifications');
    });

    it('should ignore QC flags created by services in QC summaries of AOT and MUON ', async () => {
        await navigateToRunsPerDataPass(page, 2, 1, 3); // apass
        await expectInnerText(page, '#row106-VTX-text', '100');
    });


    it('displays QC flag comments in detector summary popover', async () => {
        await navigateToRunsPerDataPass(page, 2, 1, 3);

        const qcPopoverTrigger = await page.waitForSelector('#row106 .column-CPV .popover-trigger');
        const popoverSelector = await getPopoverSelector(qcPopoverTrigger);

        await qcPopoverTrigger.hover();
        await page.waitForSelector(popoverSelector);

        const popoverText = await getPopoverInnerText(qcPopoverTrigger);
        const popoverTextLines = popoverText.split('\n').map((line) => line.trim());
        expect(popoverTextLines).to.have.same.members([
            'Flag 1',
            'Limited Acceptance MC Reproducible',
            'Some qc comment 1',
            'Flag 2',
            'Limited acceptance',
            'Some qc comment 2',
            'Flag 3',
            'Bad',
            'Some qc comment 3',
        ])
    });

    it('should successfully display tooltip information on GAQ column', async () => {
        const popoverContent = await getPopoverContent(await page.waitForSelector('#globalAggregatedQuality .popover-trigger'));
        expect(popoverContent).to.equal('Global aggregated flag based on critical detectors.' +
            'Default detectors: FT0, ITS, TPC (and ZDC for heavy-ion runs)');
    });

    it('should switch mcReproducibleAsNotBad', async () => {
        await pressElement(page, '#mcReproducibleAsNotBadToggle input', true);
        await waitForTableLength(page, 3);
        await expectInnerText(page, 'tr#row106 .column-CPV a', '89');
        await expectLink(page, 'tr#row106 .column-CPV a', {
            href: 'http://localhost:4000/?page=qc-flags-for-data-pass&runNumber=106&dplDetectorId=1&dataPassId=1',
            innerText: '89',
        });
        await pressElement(page, '#mcReproducibleAsNotBadToggle input', true);
        await waitForTableLength(page, 3);
        await expectInnerText(page, 'tr#row106 .column-CPV a', '67MC.R');
        await expectLink(page, 'tr#row106 .column-CPV a', {
            href: 'http://localhost:4000/?page=qc-flags-for-data-pass&runNumber=106&dplDetectorId=1&dataPassId=1',
            innerText: '67MC.R',
        });
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
        await navigateToRunsPerDataPass(page, 1, 3, 4);

        await expectInnerText(page, '#row56 td:nth-child(3)', '08/08/2019\n20:00:00');
        await expectInnerText(page, '#row56 td:nth-child(4)', '08/08/2019\n21:00:00');

        await pressElement(page, '#preferences-raw-timestamps', true);
        await expectInnerText(page, '#row56 td:nth-child(3)', '1565294400000');
        await expectInnerText(page, '#row56 td:nth-child(4)', '1565298000000');

        // Go back to normal
        await pressElement(page, '#preferences-raw-timestamps', true);
    });

    it('can set how many runs are available per page', async () => {
        await navigateToRunsPerDataPass(page, 1, 3, 4);
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
        await navigateToRunsPerDataPass(page, 1, 3, 4);
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
        await navigateToRunsPerDataPass(page, 1, 3, 4);
        await page.waitForSelector('tbody tr');
        const expectedRunNumber = await getInnerText(await page.waitForSelector('tbody tr:first-of-type a'));

        await waitForNavigation(page, async () => await pressElement(page, 'tbody tr:first-of-type a'));
        const redirectedUrl = await page.url();

        const urlParameters = redirectedUrl.slice(redirectedUrl.indexOf('?') + 1).split('&');

        expect(urlParameters).to.contain('page=run-detail');
        expect(urlParameters).to.contain(`runNumber=${expectedRunNumber}`);
    });

    it('should successfully export runs', async () => {
        await navigateToRunsPerDataPass(page, 1, 3, 4);

        const targetFileName = 'data.json';

        // First export
        await pressElement(page, '#actions-dropdown-button .popover-trigger', true);
        await pressElement(page, '#export-data-trigger');
        await page.waitForSelector('#export-data-modal');
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

    it('should successfully export runs with QC flags as CSV', async () => {
        await navigateToRunsPerDataPass(page, 2, 1, 3);

        const targetFileName = 'data.csv';

        // First export
        await pressElement(page, '#actions-dropdown-button .popover-trigger', true);
        await pressElement(page, '#export-data-trigger');
        await page.waitForSelector('#export-data-modal');
        await page.waitForSelector('#send:disabled');
        await page.waitForSelector('.form-control');
        await page.select('.form-control', 'runNumber', 'VTX', 'CPV');
        await pressElement(page, '#data-export-type-CSV');
        await page.waitForSelector('#send:enabled');
        const exportButtonText = await page.$eval('#send', (button) => button.innerText);
        expect(exportButtonText).to.be.eql('Export');

        const downloadPath = await waitForDownload(page, () => pressElement(page, '#send', true));

        // Check download
        const downloadFilesNames = fs.readdirSync(downloadPath);
        expect(downloadFilesNames.filter((name) => name == targetFileName)).to.be.lengthOf(1);
        const exportContent = fs.readFileSync(path.resolve(downloadPath, targetFileName)).toString();

        expect(exportContent.trim()).to.be.eql([
            'runNumber;VTX;CPV',
            '108;"";""',
            '107;"";"Good (from: 1565290800000 to: 1565359260000) | Limited Acceptance MC Reproducible (from: 1565269140000 to: 1565290800000)"',
            '106;"Good (from: 1565269200000 to: 1565304200000) | Good (from: 1565324200000 to: 1565359200000)";"Limited Acceptance MC Reproducible (from: 1565304200000 to: 1565324200000) | Limited acceptance (from: 1565329200000 to: 1565334200000) | Bad (from: 1565339200000 to: 1565344200000)"',
        ].join('\r\n'));
        fs.unlinkSync(path.resolve(downloadPath, targetFileName));
    });

    // Filters
    it('should successfully apply runNumber filter', async () => {
        await navigateToRunsPerDataPass(page, 2, 1, 3);

        await pressElement(page, '#openFilterToggle');

        await fillInput(page, '.runNumber-filter input[type=text]', '108,107', ['change']);
        await waitForTableLength(page, 2);
        await expectColumnValues(page, 'runNumber', ['108', '107']);

        await pressElement(page, '#openFilterToggle');
        await pressElement(page, '#reset-filters');
        await waitForTableLength(page, 3);
        await expectColumnValues(page, 'runNumber', ['108', '107', '106']);
    });

    it('should successfully apply detectors filter', async () => {
        await navigateToRunsPerDataPass(page, 2, 2, 3);

        await pressElement(page, '#openFilterToggle');

        await pressElement(page, '.detectors-filter .dropdown-trigger');
        await pressElement(page, '#detector-filter-dropdown-option-CPV', true);
        await expectColumnValues(page, 'runNumber', ['2', '1']);

        await pressElement(page, '#openFilterToggle');
        await pressElement(page, '#reset-filters');
        await expectColumnValues(page, 'runNumber', ['55', '2', '1']);
    });

    it('should successfully apply tags filter', async () => {
        await navigateToRunsPerDataPass(page, 2, 1, 3);
        await pressElement(page, '#openFilterToggle');

        await pressElement(page, '.tags-filter .dropdown-trigger');

        await pressElement(page, '#tag-dropdown-option-FOOD', true);
        await pressElement(page, '#tag-dropdown-option-RUN', true);

        await expectColumnValues(page, 'runNumber', ['106']);

        await pressElement(page, '#openFilterToggle');
        await pressElement(page, '#reset-filters');
        await expectColumnValues(page, 'runNumber', ['108', '107', '106']);
    });

    it('should successfully apply duration filter', async () => {
        await navigateToRunsPerDataPass(page, 2, 2, 3);
        await pressElement(page, '#openFilterToggle');

        await page.select('.runDuration-filter select', '>=');

        /**
         * Invocation of page.select and fillInput in case of amountFilter results in two concurrent,
         * async actions whereas a result of only one of them is saved into model.
         * Therefore additional action is invoked in between
         */
        await page.select('.runDuration-filter select', '>=');
        await fillInput(page, '#duration-operand', '10', ['change']);

        await expectColumnValues(page, 'runNumber', ['55', '1']);

        await pressElement(page, '#openFilterToggle');
        await pressElement(page, '#reset-filters');
        await expectColumnValues(page, 'runNumber', ['55', '2', '1']);
    });

    it('should successfully apply alice currents filters', async () => {
        await navigateToRunsPerDataPass(page, 1, 3, 4);
        await pressElement(page, '#openFilterToggle');

        const popoverSelector = await getPopoverSelector(await page.waitForSelector('.aliceL3AndDipoleCurrent-filter .popover-trigger'));
        await pressElement(page, `${popoverSelector} .dropdown-option:last-child`, true); // Select 30003kA/0kA

        await expectColumnValues(page, 'runNumber', ['54']);

        await pressElement(page, '#openFilterToggle');
        await pressElement(page, '#reset-filters');
        await expectColumnValues(page, 'runNumber', ['105', '56', '54', '49']);
    });

    const inelasticInteractionRateFilteringTestsParameters = {
        inelasticInteractionRateAvg: { operator: '<=', value: 50000, expectedRuns: ['56', '54'] },
        inelasticInteractionRateAtStart: { operator: '>', value: 20000, expectedRuns: ['56'] },
        inelasticInteractionRateAtMid: { operator: '<', value: 30000, expectedRuns: ['54'] },
        inelasticInteractionRateAtEnd: { operator: '>', value: 40000, expectedRuns: ['56'] },
    };

    for (const [property, testParameters] of Object.entries(inelasticInteractionRateFilteringTestsParameters)) {
        const { operator, value, expectedRuns } = testParameters;
        it(`should successfully apply ${property} filters`, async () => {
            await expectColumnValues(page, 'runNumber', ['105', '56', '54', '49']);
            await pressElement(page, '#openFilterToggle');

            await page.waitForSelector(`#${property}-operator`);
            await page.select(`#${property}-operator`, operator);
            await fillInput(page, `#${property}-operand`, value, ['change']);
            await expectColumnValues(page, 'runNumber', expectedRuns);

            await pressElement(page, '#openFilterToggle');
            await pressElement(page, '#reset-filters', true);
            await expectColumnValues(page, 'runNumber', ['105', '56', '54', '49']);
        });
    }

    it('should successfully apply gaqNotBadFraction filters', async () => {
        await navigateToRunsPerDataPass(page, 2, 1, 3);

        await pressElement(page, '#openFilterToggle', true);

        await page.waitForSelector('#gaqNotBadFraction-operator');
        await page.select('#gaqNotBadFraction-operator', '<=');
        await fillInput(page, '#gaqNotBadFraction-operand', '80', ['change']);
        await expectColumnValues(page, 'runNumber', ['107']);

        await pressElement(page, '#mcReproducibleAsNotBadToggle input', true);
        await expectColumnValues(page, 'runNumber', []);

        await pressElement(page, '#openFilterToggle', true);
        await pressElement(page, '#reset-filters', true);
        await expectColumnValues(page, 'runNumber', ['108', '107', '106']);
    });

    it('should successfully apply detectors notBadFraction filters', async () => {
        await page.waitForSelector('#detectorsQc-for-1-notBadFraction-operator');
        await page.select('#detectorsQc-for-1-notBadFraction-operator', '<=');
        await fillInput(page, '#detectorsQc-for-1-notBadFraction-operand', '90', ['change']);
        await expectColumnValues(page, 'runNumber', ['106']);

        await pressElement(page, '#mcReproducibleAsNotBadToggle input', true);
        await expectColumnValues(page, 'runNumber', ['107', '106']);

        await pressElement(page, '#openFilterToggle', true);
        await pressElement(page, '#reset-filters', true);
        await expectColumnValues(page, 'runNumber', ['108', '107', '106']);
    });

    it('should successfully apply muInelasticInteractionRate filters', async () => {
        await navigateToRunsPerDataPass(page, 2, 1, 3);
        await pressElement(page, '#openFilterToggle');

        await page.waitForSelector('#muInelasticInteractionRate-operand');
        await page.select('#muInelasticInteractionRate-operator', '>=');
        await fillInput(page, '#muInelasticInteractionRate-operand', 0.03, ['change']);
        await expectColumnValues(page, 'runNumber', ['106']);

        await pressElement(page, '#openFilterToggle');
        await pressElement(page, '#reset-filters', true);
        await expectColumnValues(page, 'runNumber', ['108', '107', '106']);
    });

    it('should successfully mark as skimmable', async () => {

        await expectInnerText(page, '#skimmableControl .badge', 'Skimmable');
        await DataPassRepository.updateAll({ skimmingStage: null }, { where: { id: 1 } });
        await navigateToRunsPerDataPass(page, 2, 1, 3);
        await expectInnerText(page, '#skimmableControl button', 'Mark as skimmable');
        setConfirmationDialogToBeAccepted(page);
        await pressElement(page, '#skimmableControl button', true);
        unsetConfirmationDialogActions(page);
        await expectInnerText(page, '#skimmableControl .badge', 'Skimmable');
    });

    it('should display bad runs marked out', async () => {
        await navigateToRunsPerDataPass(page, 2, 2, 3);

        await page.waitForSelector('tr#row2.danger');
        await page.waitForSelector('tr#row2 .column-CPV .popover-trigger svg');
        const popoverSelector = await getPopoverSelector(await page.waitForSelector('tr#row2 .column-CPV .popover-trigger'));
        const popoverContent = await getPopoverContent(await page.$(popoverSelector));
        expect(popoverContent).to.be.equal('Quality of run 2 was changed to bad so it is no more subject to QC');
    });

    it('should successfully change ready_for_skimming status', async () => {
        await navigateToRunsPerDataPass(page, 2, 1, 3);
        await expectColumnValues(page, 'readyForSkimming', ['not ready', 'not ready', 'ready']);
        await pressElement(page, '#row108-readyForSkimming input', true);
        await expectInnerText(page, '#row108-readyForSkimming', 'ready');
        await pressElement(page, '#row108-readyForSkimming input', true);
        await expectInnerText(page, '#row108-readyForSkimming', 'not ready');
    });

    describe('Freeze/unfreeze of data pass', async () => {
        before(async () => {
            await page.evaluate((role) => {
                // eslint-disable-next-line no-undef
                sessionService.get().token = role;

                // eslint-disable-next-line no-undef
                sessionService.get().access.push(role);
            }, BkpRoles.DPG_ASYNC_QC_ADMIN);
        });

        it('should successfully freeze a given data pass', async () => {
            await navigateToRunsPerDataPass(page, 2, 1, 3);
            await pressElement(page, '#actions-dropdown-button .popover-trigger', true);
            const popoverSelector = await getPopoverSelector(await page.waitForSelector('#actions-dropdown-button .popover-trigger'));

            await expectInnerText(page, `${popoverSelector} button:nth-child(3)`, 'Freeze the data pass');
            await pressElement(page, `${popoverSelector} button:nth-child(3)`, true);
        });

        it('should successfully disable QC flag creation when data pass is frozen', async () => {
            await waitForTableLength(page, 3);
            await page.waitForSelector('.select-multi-flag', { hidden: true });
            await pressElement(page, '#actions-dropdown-button .popover-trigger');
            await page.waitForSelector('#set-qc-flags-trigger[disabled]');
            await page.waitForSelector('#row107-ACO-text button[disabled]');
        });

        it('should successfully un-freeze a given data pass', async () => {
            const popoverSelector = await getPopoverSelector(await page.waitForSelector('#actions-dropdown-button .popover-trigger'));

            await expectInnerText(page, `${popoverSelector} button:nth-child(3)`, 'Unfreeze the data pass');
            await pressElement(page, `${popoverSelector} button:nth-child(3)`);
        });

        it('should successfully enable QC flag creation when data pass is un-frozen', async () => {
            await waitForTableLength(page, 3);
            await pressElement(page, '.select-multi-flag');
            await pressElement(page, '#actions-dropdown-button .popover-trigger');
            await page.waitForSelector('#set-qc-flags-trigger[disabled]', { hidden: true });
            await page.waitForSelector('#set-qc-flags-trigger');
            await page.waitForSelector('#row107-ACO-text a');
        });

        after(async () => {
            await pressElement(page, '#actions-dropdown-button .popover-trigger', true);
        });
    });

    it('should successfully not display button to discard all QC flags for the data pass', async () => {
        await pressElement(page, '#actions-dropdown-button .popover-trigger', true);
        const popoverSelector = await getPopoverSelector(await page.waitForSelector('#actions-dropdown-button .popover-trigger'));
        await page.waitForSelector(`${popoverSelector} button:nth-child(4)`, { hidden: true });
        await pressElement(page, '#actions-dropdown-button .popover-trigger', true);
    });

    it('should successfully discard all QC flags for the data pass', async () => {
        await page.evaluate((role) => {
            // eslint-disable-next-line no-undef
            sessionService.get().token = role;

            // eslint-disable-next-line no-undef
            sessionService.get().access.push(role);
        }, BkpRoles.DPG_ASYNC_QC_ADMIN);
        const popoverSelector = await getPopoverSelector(await page.waitForSelector('#actions-dropdown-button .popover-trigger'));
        // Press again actions dropdown to re-trigger render
        await pressElement(page, '#actions-dropdown-button .popover-trigger', true);
        setConfirmationDialogToBeAccepted(page);
        await pressElement(page, `${popoverSelector} button:nth-child(4)`, true);
        await pressElement(page, '#actions-dropdown-button .popover-trigger', true);
        await waitForTableLength(page, 3);
        // Processing of data might take a bit of time, but then expect QC flag button to be there
        await expectInnerText(
            page,
            '#row106-CPV-text',
            'QC',
            { timeout: 10000, polling: 'mutation' },
        );
    });

    it('should display correct AOT and MUON columns for different data passes', async () => {
        await navigateToRunsPerDataPass(page, 1, 3, 4); // apass
        await page.waitForSelector('#VTX');
        await checkPopoverInnerText(page, '#VTX .popover-trigger', 'Vertexing')
        await page.waitForSelector('#EVS');
        await checkPopoverInnerText(page, '#EVS .popover-trigger', 'Event Selection')
        await page.waitForSelector('#MUD');
        await checkPopoverInnerText(page, '#MUD .popover-trigger', 'Moun Detectors: MCH/MID')

        await navigateToRunsPerDataPass(page, 3, 9, 1); // cpass
        await page.waitForSelector('#VTX', { hidden: true });
        await page.waitForSelector('#EVS');
        await page.waitForSelector('#MUD');
    });

    
};
