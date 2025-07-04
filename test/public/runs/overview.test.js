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
    getFirstRow,
    goToPage,
    checkColumnBalloon,
    fillInput,
    getPopoverContent,
    getInnerText,
    getPopoverSelector,
    getPeriodInputsSelectors,
    waitForTableLength,
    waitForNavigation,
    waitForTableTotalRowsCountToEqual,
    expectInputValue,
    expectColumnValues,
    waitForEmptyTable,
    waitForDownload,
    expectLink,
    expectUrlParams,
    expectAttributeValue,
    getColumnCellsInnerTexts,
} = require('../defaults.js');
const { RUN_QUALITIES, RunQualities } = require('../../../lib/domain/enums/RunQualities.js');
const { resetDatabaseContent } = require('../../utilities/resetDatabaseContent.js');
const { RunDefinition } = require('../../../lib/domain/enums/RunDefinition.js');
const { runService } = require('../../../lib/server/services/run/RunService.js');

const { expect } = chai;

const EXPORT_RUNS_TRIGGER_SELECTOR = '#export-runs-trigger';

module.exports = () => {
    let page;
    let browser;

    let table;
    let firstRowId;
    const filterPanelRunNumbersInputSelector = '.runNumber-filter input';

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
        const response = await goToPage(page, 'run-overview');

        // We expect the page to return the correct status code, making sure the server is running properly
        expect(response.status()).to.equal(200);

        // We expect the page to return the correct title, making sure there isn't another server running on this port
        const title = await page.title();
        expect(title).to.equal('AliceO2 Bookkeeping');
    });

    it('shows correct datatypes in respective columns', async () => {
        table = await page.$$('tr');
        firstRowId = await getFirstRow(table, page);

        // Expectations of header texts being of a certain datatype
        const headerDatatypes = {
            runNumber: (number) => typeof number == 'number',
            fillNumber: (number) => typeof number == 'number',
            timeO2Start: (date) => !isNaN(Date.parse(date)),
            timeO2End: (date) => !isNaN(Date.parse(date)),
            timeTrgStart: (date) => !isNaN(Date.parse(date)),
            timeTrgEnd: (date) => !isNaN(Date.parse(date)),
            runDuration: (fullDuration) => {
                const [duration, unit] = fullDuration.split(' ');
                return fullDuration === 'RUNNING' || 'UNKNOWN' || !isNaN(parseInt(duration, 10)) && unit === 'sec';
            },
            environmentId: (number) => typeof number == 'number',
            runType: (string) => typeof string == 'string',
            runQuality: (string) => RUN_QUALITIES.includes(string),
            nDetectors: (number) => typeof number == 'number',
            nFlps: (number) => typeof number == 'number',
            nEpns: (string) => typeof string == 'string',
            nSubtimeframes: (number) => typeof number == 'number',
            bytesReadOut: (number) => typeof number == 'number',
            dcs: (boolean) => typeof boolean == 'boolean',
            epn: (boolean) => typeof boolean == 'boolean',
            eorReasons: (string) => typeof string == 'string',
            detectors: (string) => typeof string == 'string',
        };

        // We find the headers matching the datatype keys
        const headers = await page.$$('th');
        const headerIndices = {};
        for (const [index, header] of headers.entries()) {
            const headerContent = await page.evaluate((element) => element.id, header);
            const matchingDatatype = Object.keys(headerDatatypes).find((key) => headerContent === key);
            if (matchingDatatype !== undefined) {
                headerIndices[index] = matchingDatatype;
            }
        }

        // We expect every value of a header matching a datatype key to actually be of that datatype
        const firstRowCells = await page.$$(`#${firstRowId} td`);
        for (const [index, cell] of firstRowCells.entries()) {
            if (Object.keys(headerIndices).includes(index)) {
                const cellContent = await page.evaluate((element) => element.innerText, cell);
                const expectedDatatype = headerDatatypes[headerIndices[index]](cellContent);
                expect(expectedDatatype).to.be.true;
            }
        }
    });

    it('Should display the correct items counter at the bottom of the page', async () => {
        await goToPage(page, 'run-overview');

        await expectInnerText(page, '#firstRowIndex', '1');
        await expectInnerText(page, '#lastRowIndex', '8');
        await expectInnerText(page, '#totalRowsCount', '108');
    });

    it('successfully switch to raw timestamp display', async () => {
        await expectInnerText(page, '#row106 td:nth-child(6)', '08/08/2019\n13:00:00');
        await expectInnerText(page, '#row106 td:nth-child(7)', '09/08/2019\n14:00:00');
        await pressElement(page, '#preferences-raw-timestamps', true);

        await expectInnerText(page, '#row106 td:nth-child(6)', '1565269200000');
        await expectInnerText(page, '#row106 td:nth-child(7)', '1565359200000');

        // Go back to normal
        await pressElement(page, '#preferences-raw-timestamps', true);
    });

    it('can switch to infinite mode in amountSelector', async () => {
        const INFINITE_SCROLL_CHUNK = 19;
        await goToPage(page, 'run-overview');

        // Wait fot the table to be loaded, it should have at least 2 rows (not loading) but less than 19 rows (which is infinite scroll chunk)
        await page.waitForSelector('table tbody tr:nth-child(2)');
        expect(await page.$(`table tbody tr:nth-child(${INFINITE_SCROLL_CHUNK})`)).to.be.null;

        const amountSelectorButtonSelector = await '#amountSelector button';

        // Expect the dropdown options to be visible when it is selected
        await pressElement(page, amountSelectorButtonSelector);

        const amountSelectorDropdown = await page.$('#amountSelector .dropup-menu');
        expect(Boolean(amountSelectorDropdown)).to.be.true;

        const infiniteModeButtonSelector = '#amountSelector .dropup-menu .menu-item:nth-last-child(-n +2)';
        await pressElement(page, infiniteModeButtonSelector);

        // Wait for the first chunk to be loaded
        await page.waitForSelector(`table tbody tr:nth-child(${INFINITE_SCROLL_CHUNK})`);
        expect((await getInnerText(await page.$(amountSelectorButtonSelector))).trim().endsWith('Infinite')).to.be.true;

        await page.evaluate(() => {
            document.querySelector('table tbody tr:last-child').scrollIntoView({ behavior: 'instant' });
        });

        await page.waitForSelector(`table tbody tr:nth-child(${INFINITE_SCROLL_CHUNK})`);
        expect(await page.$(`table tbody tr:nth-child(${INFINITE_SCROLL_CHUNK})`)).to.not.be.null;
    });

    it('can set how many runs are available per page', async () => {
        await goToPage(page, 'run-overview');

        const amountSelectorId = '#amountSelector';
        const amountSelectorButtonSelector = `${amountSelectorId} button`;
        await pressElement(page, amountSelectorButtonSelector);

        const amountSelectorDropdown = await page.$(`${amountSelectorId} .dropup-menu`);
        expect(Boolean(amountSelectorDropdown)).to.be.true;

        const amountItems5 = `${amountSelectorId} .dropup-menu .menu-item:first-child`;
        await pressElement(page, amountItems5);

        // Expect the amount selector to currently be set to 5 when the first option (5) is selected
        await expectInnerText(page, '.dropup button', 'Rows per page: 5 ');
        await waitForTableLength(page, 5);

        // Expect the custom per page input to have red border and text color if wrong value typed
        const customPerPageInput = await page.$(`${amountSelectorId} input[type=number]`);
        await customPerPageInput.evaluate((input) => input.focus());
        await page.$eval(`${amountSelectorId} input[type=number]`, (el) => {
            el.value = '1111';
            el.dispatchEvent(new Event('input'));
        });
        await page.waitForSelector('input:invalid');
    });

    it('dynamically switches between visible pages in the page selector', async () => {
        // Override the amount of runs visible per page manually
        await goToPage(page, 'run-overview');
        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.runs.overviewModel.pagination.itemsPerPage = 1;
        });
        await waitForTableLength(page, 1);

        // Expect the page five button to now be visible, but no more than that
        const pageFiveButton = await page.$('#page5');
        expect(Boolean(pageFiveButton)).to.be.true;
        const pageSixButton = await page.$('#page6');
        expect(Boolean(pageSixButton)).to.be.false;

        // Expect the page one button to have fallen away when clicking on page five button
        await pressElement(page, '#page5');
        await page.waitForSelector('#page1', { hidden: true });
    });

    it('notifies if table loading returned an error', async () => {
        await goToPage(page, 'run-overview');
        // eslint-disable-next-line no-return-assign, no-undef
        await page.evaluate(() => model.runs.overviewModel.pagination.itemsPerPage = 200);
        await page.waitForSelector('.alert-danger');

        // We expect there to be a fitting error message
        const expectedMessage = 'Invalid Attribute: "query.page.limit" must be less than or equal to 100';
        await expectInnerText(page, '.alert-danger', expectedMessage);

        // Revert changes for next test
        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.runs.overviewModel.pagination.itemsPerPage = 10;
        });
        await waitForTableLength(page, 10);
    });

    it('can navigate to a run detail page', async () => {
        await goToPage(page, 'run-overview');

        await page.waitForSelector('tbody tr');
        const expectedRunNumber = await page.evaluate(() => document.querySelector('tbody tr:first-of-type a').innerText);

        await waitForNavigation(page, () => page.evaluate(() => document.querySelector('tbody tr:first-of-type a').click()));

        const redirectedUrl = await page.url();
        const urlParameters = redirectedUrl.slice(redirectedUrl.indexOf('?') + 1).split('&');

        expect(urlParameters).to.contain('page=run-detail');
        expect(urlParameters).to.contain(`runNumber=${expectedRunNumber}`);
    });

    it('Should have balloon on detector, tags and eor column', async () => {
        await goToPage(page, 'run-overview');

        // Run 106 has detectors and tags that overflow
        await fillInput(page, filterPanelRunNumbersInputSelector, '106', ['change']);
        await waitForTableLength(page, 1);

        await checkColumnBalloon(page, 1, 2);
        await checkColumnBalloon(page, 1, 3);

        // Run 1 has eor reasons that overflow
        await fillInput(page, filterPanelRunNumbersInputSelector, '1,1', ['change']);
        await waitForTableLength(page, 1);

        await checkColumnBalloon(page, 1, 16);
    });

    it('Should display balloon if the text overflows', async () => {
        await goToPage(page, 'run-overview');

        await checkColumnBalloon(page, 1, 2);
    });

    it('should successfully filter on detectors', async () => {
        // Open filter toggle
        await pressElement(page, '#openFilterToggle');
        await page.waitForSelector('.detectors-filter .dropdown-trigger');

        await pressElement(page, '.detectors-filter .dropdown-trigger');
        await pressElement(page, '#detector-filter-dropdown-option-ITS', true);
        await pressElement(page, '#detector-filter-dropdown-option-FT0', true);
        await waitForTableLength(page, 4);

        table = await page.$$('tbody tr');
        expect(table.length).to.equal(4);

        await pressElement(page, '#detector-filter-combination-operator-radio-button-or', true);
        await waitForTableLength(page, 8);

        table = await page.$$('tbody tr');
        expect(table.length).to.equal(8);

        await pressElement(page, '#detector-filter-combination-operator-radio-button-none', true);
        await waitForTableLength(page, 2);

        table = await page.$$('tbody tr');
        expect(table.length).to.equal(2);

        await pressElement(page, '#reset-filters');
    });

    it('should successfully filter on tags', async () => {
        await waitForTableLength(page, 8);

        // Open filter toggle and wait for the dropdown to be visible
        await pressElement(page, '.tags-filter .dropdown-trigger');
        await pressElement(page, '#tag-dropdown-option-FOOD', true);
        await pressElement(page, '#tag-dropdown-option-RUN', true);
        await waitForTableLength(page, 1);

        await pressElement(page, '#tag-filter-combination-operator-radio-button-or', true);
        await pressElement(page, '.tags-filter .dropdown-trigger');
        await pressElement(page, '#tag-dropdown-option-RUN', true);
        await pressElement(page, '#tag-dropdown-option-TEST-TAG-41', true);
        await waitForTableLength(page, 2);

        await pressElement(page, '#tag-filter-combination-operator-radio-button-none-of', true);
        await waitForTableTotalRowsCountToEqual(page, 106);
        await pressElement(page, '#reset-filters');
    });

    it('should successfully filter on definition', async () => {
        await waitForTableTotalRowsCountToEqual(page, 108);

        const filterInputSelectorPrefix = '#run-definition-checkbox-';
        const physicsFilterSelector = `${filterInputSelectorPrefix}PHYSICS`;
        const cosmicsFilterSelector = `${filterInputSelectorPrefix}COSMICS`;
        const technicalFilterSelector = `${filterInputSelectorPrefix}TECHNICAL`;
        const syntheticFilterSelector = `${filterInputSelectorPrefix}SYNTHETIC`;
        const calibrationFilterSelector = `${filterInputSelectorPrefix}CALIBRATION`;
        const commissioningFilterSelector = `${filterInputSelectorPrefix}COMMISSIONING`;

        /**
         * Checks that all the rows of the given table have a valid run definition
         *
         * @param {number} size the expected size of the table
         * @param {string[]} authorizedRunDefinition  the list of valid run qualities
         * @return {void}
         */
        const checkTableSizeAndDefinition = async (size, authorizedRunDefinition) => {
            // Wait for the table to have the proper size
            await waitForTableLength(page, size);

            const definitions = await page.$$eval(
                '.column-definition div div div:first-child',
                (rows) => rows.map((row) => row.innerText),
            );

            try {
                expect(definitions.every((definition) => authorizedRunDefinition.includes(definition))).to.be.true;
            } catch {
                const runNumbers = await page.$$eval('tbody tr', (rows) => rows.map((row) => {
                    const rowId = row.id;
                    return document.querySelector(`#${rowId}-runNumber-text`).innerText;
                }));
                throw new Error(`Expect all run definitions ${definitions} to be one of ${authorizedRunDefinition}, for runs (${runNumbers})`);
            }
        };

        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.runs.overviewModel.pagination.itemsPerPage = 20;
        });

        await pressElement(page, physicsFilterSelector, true);
        await checkTableSizeAndDefinition(10, [RunDefinition.PHYSICS]);

        await pressElement(page, syntheticFilterSelector, true);
        await checkTableSizeAndDefinition(12, [RunDefinition.PHYSICS, RunDefinition.SYNTHETIC]);

        await pressElement(page, physicsFilterSelector, true);
        await checkTableSizeAndDefinition(2, [RunDefinition.SYNTHETIC]);

        await pressElement(page, cosmicsFilterSelector, true);
        await checkTableSizeAndDefinition(4, [RunDefinition.SYNTHETIC, RunDefinition.COSMICS]);

        await pressElement(page, syntheticFilterSelector, true);
        await checkTableSizeAndDefinition(2, [RunDefinition.COSMICS]);

        await pressElement(page, technicalFilterSelector, true);
        await checkTableSizeAndDefinition(3, [RunDefinition.COSMICS, RunDefinition.TECHNICAL]);

        await pressElement(page, cosmicsFilterSelector, true);
        await checkTableSizeAndDefinition(1, [RunDefinition.TECHNICAL]);

        await pressElement(page, calibrationFilterSelector, true);
        await checkTableSizeAndDefinition(2, [RunDefinition.TECHNICAL, RunDefinition.CALIBRATION]);

        await pressElement(page, commissioningFilterSelector, true);
        await checkTableSizeAndDefinition(20, [RunDefinition.COMMISSIONING]);

        await pressElement(page, commissioningFilterSelector, true);
        await pressElement(page, physicsFilterSelector, true);
        await pressElement(page, syntheticFilterSelector, true);
        await pressElement(page, cosmicsFilterSelector, true);

        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.runs.overviewModel.pagination.itemsPerPage = 20;
        });

        await checkTableSizeAndDefinition(
            16,
            [RunDefinition.COSMICS, RunDefinition.TECHNICAL, RunDefinition.PHYSICS, RunDefinition.SYNTHETIC, RunDefinition.CALIBRATION],
        );
    });

    it('Should correctly set the the min/max of time range picker inputs', async () => {
        await goToPage(page, 'run-overview');

        // Open the filters
        await pressElement(page, '#openFilterToggle');

        await pressElement(page, '.timeO2Start-filter .popover-trigger');

        const o2StartPopoverSelector = await getPopoverSelector(await page.$('.timeO2Start-filter .popover-trigger'));
        const periodInputsSelectors = getPeriodInputsSelectors(o2StartPopoverSelector);

        await fillInput(page, periodInputsSelectors.fromTimeSelector, '11:11', ['change']);
        await fillInput(page, periodInputsSelectors.toTimeSelector, '14:00', ['change']);

        // American style input
        await fillInput(page, periodInputsSelectors.fromDateSelector, '2021-02-03', ['change']);
        await fillInput(page, periodInputsSelectors.toDateSelector, '2021-02-03', ['change']);

        // Wait for page to be refreshed
        await expectAttributeValue(page, periodInputsSelectors.toTimeSelector, 'min', '11:12');
        await expectAttributeValue(page, periodInputsSelectors.toDateSelector, 'min', '2021-02-03');

        await expectAttributeValue(page, periodInputsSelectors.fromTimeSelector, 'max', '13:59');
        await expectAttributeValue(page, periodInputsSelectors.fromDateSelector, 'max', '2021-02-03');

        // Setting different dates, still american style input
        await fillInput(page, periodInputsSelectors.toDateSelector, '2021-02-05', ['change']);

        await expectAttributeValue(page, periodInputsSelectors.toTimeSelector, 'min', '');
        await expectAttributeValue(page, periodInputsSelectors.toDateSelector, 'min', '2021-02-03');

        await expectAttributeValue(page, periodInputsSelectors.fromTimeSelector, 'max', '');
        await expectAttributeValue(page, periodInputsSelectors.fromDateSelector, 'max', '2021-02-05');
    });

    it('should successfully filter on duration', async () => {
        await goToPage(page, 'run-overview');

        await pressElement(page, '#openFilterToggle');
        await page.waitForSelector('#duration-operator');

        const runDurationOperatorSelector = '#duration-operator';
        const runDurationOperator = await page.$(runDurationOperatorSelector) || null;
        expect(runDurationOperator).to.not.be.null;
        expect(await runDurationOperator.evaluate((element) => element.value)).to.equal('=');

        const runDurationLimitSelector = '#duration-operand';
        await fillInput(page, runDurationLimitSelector, '1500', ['change']);
        await waitForTableLength(page, 3);

        await page.select(runDurationOperatorSelector, '=');
        await waitForTableLength(page, 3);

        let runDurationList = await getColumnCellsInnerTexts(page, 'runDuration');

        expect(runDurationList.every((runDuration) => runDuration === '25:00:00')).to.be.true;

        await fillInput(page, runDurationLimitSelector, '3000', ['change']);
        await waitForTableLength(page, 0);

        await page.select(runDurationOperatorSelector, '>=');
        await waitForTableLength(page, 3);

        // Expect only unknown
        runDurationList = await page.evaluate(() => Array.from(document.querySelectorAll('tbody tr')).map((row) => {
            const rowId = row.id;
            return document.querySelector(`#${rowId}-runDuration-text`)?.innerText;
        }));

        expect(runDurationList.every((runDuration) => runDuration === 'UNKNOWN')).to.be.true;
    });

    it('should successfully apply alice currents filters', async () => {
        await pressElement(page, '#reset-filters');

        const popoverSelector = await getPopoverSelector(await page.waitForSelector('.aliceL3AndDipoleCurrent-filter .popover-trigger'));
        await pressElement(page, `${popoverSelector} .dropdown-option:last-child`, true); // Select 30003kA/0kA

        await expectColumnValues(page, 'runNumber', ['54', '53', '52']);

        await pressElement(page, '#reset-filters');
    });

    it('Should successfully filter runs by their run quality', async () => {
        await goToPage(page, 'run-overview');
        const filterInputSelectorPrefix = '#checkboxes-checkbox-';
        const badFilterSelector = `${filterInputSelectorPrefix}bad`;
        const testFilterSelector = `${filterInputSelectorPrefix}test`;

        /**
         * Checks that all the rows of the given table have a valid run quality
         *
         * @param {{evaluate: function}[]} rows the list of rows
         * @param {string[]} authorizedRunQualities  the list of valid run qualities
         * @return {void}
         */
        const checkTableRunQualities = async (rows, authorizedRunQualities) => {
            for (const row of rows) {
                expect(await row.evaluate((rowItem) => {
                    const rowId = rowItem.id;
                    return document.querySelector(`#${rowId}-runQuality-text`).innerText;
                })).to.be.oneOf(authorizedRunQualities);
            }
        };

        // Open filter toggle
        await pressElement(page, '#openFilterToggle');
        await page.waitForSelector(badFilterSelector);

        await page.$eval(badFilterSelector, (element) => element.click());
        await waitForTableLength(page, 2);

        table = await page.$$('tbody tr');
        expect(table.length).to.equal(2);
        await checkTableRunQualities(table, [RunQualities.BAD]);

        await page.$eval(testFilterSelector, (element) => element.click());
        await waitForTableLength(page, 8);

        table = await page.$$('tbody tr');
        await checkTableRunQualities(table, [RunQualities.BAD, RunQualities.TEST]);

        await page.$eval(testFilterSelector, (element) => element.click());
        await waitForTableLength(page, 2);

        table = await page.$$('tbody tr');
        expect(table.length).to.equal(2);
        await checkTableRunQualities(table, [RunQualities.BAD]);
    });

    it('Should successfully filter runs by their trigger value', async () => {
        await goToPage(page, 'run-overview');
        const filterInputSelectorPrefix = '#triggerValueCheckbox';
        const offFilterSelector = `${filterInputSelectorPrefix}OFF`;
        const ltuFilterSelector = `${filterInputSelectorPrefix}LTU`;

        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.runs.overviewModel.pagination.itemsPerPage = 10;
        });
        await waitForTableLength(page, 10);

        /**
         * Checks that all the rows of the given table have a valid trigger value
         *
         * @param {{evaluate: function}[]} rows the list of rows
         * @param {string[]} authorizedRunQualities  the list of valid run qualities
         * @return {void}
         */
        const checkTableTriggerValue = async (rows, authorizedRunQualities) => {
            for (const row of rows) {
                expect(await row.evaluate((rowItem) => {
                    const rowId = rowItem.id;
                    return document.querySelector(`#${rowId}-triggerValue-text`).innerText;
                })).to.be.oneOf(authorizedRunQualities);
            }
        };

        // Open filter toggle
        await pressElement(page, '#openFilterToggle');
        await page.waitForSelector(offFilterSelector);

        await page.$eval(offFilterSelector, (element) => element.click());
        await waitForTableLength(page, 9);

        table = await page.$$('tbody tr');
        await checkTableTriggerValue(table, ['OFF']);

        await page.$eval(ltuFilterSelector, (element) => element.click());
        await waitForTableLength(page, 10);

        table = await page.$$('tbody tr');
        await checkTableTriggerValue(table, ['OFF', 'LTU']);

        await page.$eval(ltuFilterSelector, (element) => element.click());
        await waitForTableLength(page, 9);

        table = await page.$$('tbody tr');
        await checkTableTriggerValue(table, ['OFF']);
    });

    it('should successfully filter on a list of run numbers and inform the user about it', async () => {
        const inputValue = '101, 102';
        await goToPage(page, 'run-overview');

        /**
         * This is the sequence to test filtering the runs on run numbers.
         *
         * @param {string} selector the filter input selector
         * @return {void}
         */
        const filterOnRun = async (selector) => {
            await expectAttributeValue(page, selector, 'placeholder', 'e.g. 534454, 534455...');
            await fillInput(page, selector, inputValue, ['change']);
            await waitForTableLength(page, 2);
            // Validate amount in the table
            const table = await page.$$('tbody tr');
            expect(table.length).to.equal(2);
            expect(await page.$$eval('tbody tr', (rows) => rows.map((row) => row.id))).to.eql(['row102', 'row101']);
        };

        // First filter validation on the main page.
        await filterOnRun('#runOverviewFilter .run-numbers-filter');

        // Validate if the filter tab value is equal to the main page value.
        await expectInputValue(page, filterPanelRunNumbersInputSelector, inputValue);

        // Test if it works in the filter tab.
        await pressElement(page, '#openFilterToggle');
        await pressElement(page, '#reset-filters');

        // Run the same test sequence on the filter tab.
        await filterOnRun(filterPanelRunNumbersInputSelector);
    });

    it('should successfully filter on a single run number and inform the user about it', async () => {
        const inputValue = '10';
        await goToPage(page, 'run-overview');

        /**
         * This is the sequence to test filtering the runs on run numbers.
         *
         * @param {string} selector the filter input selector
         * @return {void}
         */
        const filterOnRun = async (selector) => {
            await expectAttributeValue(page, selector, 'placeholder', 'e.g. 534454, 534455...');
            await fillInput(page, selector, inputValue, ['change']);
            await waitForTableLength(page, 8);

            // Results are filtered over 2 pages
            await expectColumnValues(page, 'runNumber', ['108', '107', '106', '105', '104', '103', '102', '101']);

            await pressElement(page, '#pageMoveRight', true);
            await waitForTableLength(page, 2);

            await expectColumnValues(page, 'runNumber', ['100', '10']);
        };

        // First filter validation on the main page.
        await filterOnRun('#runOverviewFilter .run-numbers-filter');

        // Validate if the filter tab value is equal to the main page value.
        await expectInputValue(page, filterPanelRunNumbersInputSelector, inputValue);

        // Test if it works in the filter tab.
        await pressElement(page, '#openFilterToggle');
        await pressElement(page, '#reset-filters');

        // Run the same test sequence on the filter tab.
        await filterOnRun(filterPanelRunNumbersInputSelector);
    });

    it('should successfully filter on a list of fill numbers and inform the user about it', async () => {
        await goToPage(page, 'run-overview');
        await page.evaluate(() => window.model.disableInputDebounce());
        await waitForTableLength(page, 8);

        await pressElement(page, '#openFilterToggle');

        const filterInputSelector = '.fill-numbers-filter';
        expect(await page.$eval(filterInputSelector, (input) => input.placeholder)).to.equal('e.g. 7966, 7954, 7948...');

        await fillInput(page, filterInputSelector, '1, 3', ['change']);
        await waitForTableLength(page, 6);

        await pressElement(page, '#reset-filters');
    });

    it('should successfully filter on a list of environment ids and inform the user about it', async () => {
        await waitForTableLength(page, 8);

        const filterInputSelector = '.environment-ids-filter';
        expect(await page.$eval(filterInputSelector, (input) => input.placeholder)).to.equal('e.g. Dxi029djX, TDI59So3d...');

        await fillInput(page, filterInputSelector, 'Dxi029djX, TDI59So3d', ['change']);
        await waitForTableLength(page, 6);

        await pressElement(page, '#reset-filters');
    });

    it('should successfully filter on run types', async () => {
        await waitForTableLength(page, 8);

        await pressElement(page, '.runType-filter .dropdown-trigger');
        await pressElement(page, '#run-types-dropdown-option-2', true);
        await pressElement(page, '#run-types-dropdown-option-14', true);
        await waitForTableLength(page, 5);

        await pressElement(page, '#reset-filters');
    });

    it('should successfully filter on nDetectors', async () => {
        await waitForTableLength(page, 8);
        await expectInputValue(page, '#nDetectors-operator', '=');

        await page.select('#nDetectors-operator', '<=');
        await fillInput(page, '#nDetectors-operand', '1', ['change']);
        await waitForTableLength(page, 6);

        const nDetectorsList = await page.evaluate(() => Array.from(document.querySelectorAll('tbody tr')).map((row) => {
            const rowId = row.id;
            return document.querySelector(`#${rowId}-detectors .nDetectors-badge`)?.innerText;
        }));

        // The nDetectors can be null if the detectors' field is null but the nDetectors is not, which can be added in tests data
        expect(nDetectorsList.every((nDetectors) => parseInt(nDetectors, 10) <= 1 || nDetectors === null)).to.be.true;

        await pressElement(page, '#reset-filters');
    });

    it('should successfully filter on nFLPs', async () => {
        await waitForTableLength(page, 8);

        await expectInputValue(page, '#nFlps-operator', '=');

        await page.select('#nFlps-operator', '<=');
        await fillInput(page, '#nFlps-operand', '10', ['change']);
        await waitForTableLength(page, 5);

        const nFlpsList = await page.evaluate(() => Array.from(document.querySelectorAll('tbody tr')).map((row) => {
            const rowId = row.id;
            return document.querySelector(`#${rowId}-nFlps-text`)?.innerText;
        }));
        expect(nFlpsList.every((nFlps) => parseInt(nFlps, 10) <= 10)).to.be.true;

        await pressElement(page, '#reset-filters');
    });

    it('should successfully filter on nEPNs', async () => {
        await waitForTableLength(page, 8);

        await expectInputValue(page, '#nEpns-operator', '=');

        await page.select('#nEpns-operator', '<=');
        await fillInput(page, '#nEpns-operand', '10', ['change']);
        await waitForTableLength(page, 5);

        await expectColumnValues(page, 'nEpns', ['10', '10', 'OFF', 'OFF', '10']);
        await pressElement(page, '#reset-filters');
    });

    it('should successfully filter on EPN on/off', async () => {
        await waitForTableLength(page, 8);

        await pressElement(page, '#epnFilterRadioOFF', true);
        await waitForTableLength(page, 2);

        await pressElement(page, '#reset-filters');
    });

    it('should successfully filter by EOR Reason types', async () => {
        await waitForTableLength(page, 8);

        // Expect the EOR filter to exist
        await page.waitForSelector('#eorCategories');
        const eorTitleDropdown = await page.waitForSelector('#eorTitles');

        // Select the EOR reason category DETECTORS
        await page.select('#eorCategories', 'DETECTORS');
        await waitForTableLength(page, 3);
        let detectorTitleElements = await eorTitleDropdown.$$('option');
        expect(detectorTitleElements).has.lengthOf(3);

        // The titles dropdown should have updated
        const detectorTitles = await Promise.all(detectorTitleElements
            .map(async (element) => (await element.getProperty('value')).jsonValue()));
        expect(detectorTitles).deep.to.equal(['', 'CPV', 'TPC']);

        /*
         * The correct number of runs should be displayed in the table.
         * Furthermore, each of the displayed EOR reasons should contain 'DETECTORS'
         */
        let eorReasons = await page.$$('table td[id$="eorReasons"]');
        expect(eorReasons).has.lengthOf(3);

        let eorReasonTexts = await Promise.all(eorReasons.map(async (element) => (await element.getProperty('innerText')).jsonValue()));

        let allTextsContainDetectors = eorReasonTexts.every((text) => text.includes('DETECTORS'));
        expect(allTextsContainDetectors).to.be.true;

        // Select the EOR reason title CPV
        await page.select('#eorTitles', 'CPV');
        await waitForTableLength(page, 2);

        /*
         * The correct number of runs should be displayed in the table.
         * Furthermore, each of the displayed EOR reasons should contain 'DETECTORS - CPV'
         */
        eorReasons = await page.$$('table td[id$="eorReasons"]');
        expect(eorReasons).has.lengthOf(2);

        eorReasonTexts = await Promise.all(eorReasons.map(async (element) => (await element.getProperty('innerText')).jsonValue()));

        allTextsContainDetectors = eorReasonTexts.every((text) => text.includes('DETECTORS - CPV'));
        expect(allTextsContainDetectors).to.be.true;

        // Reset filters. There should be a single blank option in the EOR titles dropdown
        await page.click('#reset-filters');
        await waitForTableLength(page, 8);
        detectorTitleElements = await eorTitleDropdown.$$('option');
        expect(detectorTitleElements).has.lengthOf(1);

        // There should be many items in the run details table
        eorReasons = await page.$$('table td[id$="eorReasons"]');
        expect(eorReasons.length).to.be.greaterThan(3);

        await pressElement(page, '#reset-filters');
    });

    it('should correctly filter by EOR reason description', async () => {
        await waitForTableLength(page, 8);

        // Expect there to be one result that contains a certain description
        const descriptionInput = 'some';
        await fillInput(page, '#eorDescription', descriptionInput, ['change']);
        await waitForTableLength(page, 2);

        let eorReasons = await page.$$('table td[id$="eorReasons"]');
        expect(eorReasons).has.lengthOf(2);
        const eorReasonText = await (await eorReasons[0].getProperty('innerText')).jsonValue();
        expect(eorReasonText.toLowerCase()).to.include(descriptionInput);

        // Assuming this result had the category DETECTORS, when we select a different category it should disappear.
        await page.select('#eorCategories', 'OTHER');
        await waitForEmptyTable(page);
        eorReasons = await page.$$('table td[id$="eorReasons"]');
        expect(eorReasons).has.lengthOf(0);

        // When we reset the filters, the input field should be empty
        await pressElement(page, '#reset-filters');
        await waitForTableLength(page, 8);
        eorReasons = await page.$$('table td[id$="eorReasons"]');
        expect(eorReasons.length).to.be.greaterThan(1);

        await expectInputValue(page, '#eorDescription', '');
    });

    it('should successfully display runs export button', async () => {
        await goToPage(page, 'run-overview');
        await page.waitForSelector(EXPORT_RUNS_TRIGGER_SELECTOR);
        const runsExportButton = await page.$(EXPORT_RUNS_TRIGGER_SELECTOR);
        expect(runsExportButton).to.be.not.null;
    });

    it('should successfully display runs export modal on click on export button', async () => {
        let exportModal = await page.$('#export-runs-modal');
        expect(exportModal).to.be.null;

        await page.$eval(EXPORT_RUNS_TRIGGER_SELECTOR, (button) => button.click());
        await page.waitForSelector('#export-runs-modal');
        exportModal = await page.$('#export-runs-modal');

        expect(exportModal).to.not.be.null;
    });

    it('should successfully display information when export will be truncated', async () => {
        await goToPage(page, 'run-overview');

        await pressElement(page, EXPORT_RUNS_TRIGGER_SELECTOR, true);

        const truncatedExportWarning = await page.waitForSelector('#export-runs-modal #truncated-export-warning');
        expect(await truncatedExportWarning.evaluate((warning) => warning.innerText))
            .to
            .equal('The runs export is limited to 100 entries, only the last runs will be exported (sorted by run number)');
    });

    it('should successfully display disabled runs export button when there is no runs available', async () => {
        await goToPage(page, 'run-overview');

        await pressElement(page, '#openFilterToggle');

        // Type a fake run number to have no runs
        await fillInput(page, filterPanelRunNumbersInputSelector, '99999999999', ['change']);
        await pressElement(page, '#openFilterToggle');

        await page.waitForSelector(`${EXPORT_RUNS_TRIGGER_SELECTOR}:disabled`);
    });

    it('should successfully export filtered runs', async () => {
        await goToPage(page, 'run-overview');

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

        {
            const downloadPath = await waitForDownload(page, () => pressElement(page, '#send', true));

            // Check download
            const downloadFilesNames = fs.readdirSync(downloadPath);
            expect(downloadFilesNames.filter((name) => name === targetFileName)).to.be.lengthOf(1);
            const runs = JSON.parse(fs.readFileSync(path.resolve(downloadPath, targetFileName)));

            expect(runs).to.be.lengthOf(100);
            expect(runs.every(({ runQuality, runNumber, ...otherProps }) =>
                runQuality && runNumber && Object.keys(otherProps).length === 0)).to.be.true;
            fs.unlinkSync(path.resolve(downloadPath, targetFileName));
        }

        // Second export

        // Apply filtering
        const filterInputSelectorPrefix = '#checkboxes-checkbox-';
        const badFilterSelector = `${filterInputSelectorPrefix}bad`;

        await pressElement(page, '#openFilterToggle');
        await page.waitForSelector(badFilterSelector);
        await page.$eval(badFilterSelector, (element) => element.click());
        await page.waitForSelector('.atom-spinner');
        await page.waitForSelector('tbody tr:nth-child(2)');
        await page.waitForSelector(EXPORT_RUNS_TRIGGER_SELECTOR);

        ///// Download
        await page.$eval(EXPORT_RUNS_TRIGGER_SELECTOR, (button) => button.click());
        await page.waitForSelector('#export-runs-modal');

        await page.waitForSelector('.form-control');
        await page.select('.form-control', 'runQuality', 'runNumber');

        {
            const downloadPath = await waitForDownload(page, () => pressElement(page, '#send:enabled', true));

            // Check download
            const downloadFilesNames = fs.readdirSync(downloadPath);
            expect(downloadFilesNames.filter((name) => name === targetFileName)).to.be.lengthOf(1);
            const runs = JSON.parse(fs.readFileSync(path.resolve(downloadPath, targetFileName)));
            expect(runs).to.have.all.deep.members([{ runNumber: 2, runQuality: 'bad' }, { runNumber: 1, runQuality: 'bad' }]);
        }
    });

    it('should successfully navigate to the LHC fill details page', async () => {
        await goToPage(page, 'run-overview');

        await waitForNavigation(page, () => pressElement(page, '#row108-fillNumber a'));
        expectUrlParams(page, { page: 'lhc-fill-details', fillNumber: 1 });
    });

    it('should successfully display duration without warning popover when run has trigger OFF', async () => {
        await goToPage(page, 'run-overview');
        const runDurationCell = await page.waitForSelector('#row107-runDuration');
        expect(await runDurationCell.$('.popover-trigger')).to.be.null;
        expect(await runDurationCell.evaluate((element) => element.innerText)).to.equal('25:00:00');
    });

    it('should successfully display duration without warning popover when run has both trigger start and stop', async () => {
        await goToPage(page, 'run-overview');
        const runDurationCell = await page.waitForSelector('#row106-runDuration');
        expect(await runDurationCell.$('.popover-trigger')).to.be.null;
        expect(await runDurationCell.evaluate((element) => element.innerText)).to.equal('25:00:00');
    });

    it('should successfully display UNKNOWN without warning popover when run last for more than 48 hours', async () => {
        const runDurationCell = await page.waitForSelector('#row105-runDuration');
        expect(await runDurationCell.$('.popover-trigger')).to.be.null;
        expect(await runDurationCell.evaluate((element) => element.innerText)).to.equal('UNKNOWN');
    });

    it('should successfully display popover warning when run is missing trigger start', async () => {
        const popoverContent = await getPopoverContent(await page.waitForSelector('#row104-runDuration .popover-trigger'));
        expect(popoverContent).to.equal('Duration based on o2 start because of missing trigger start information');
    });

    it('should successfully display popover warning when run is missing trigger stop', async () => {
        const popoverContent = await getPopoverContent(await page.waitForSelector('#row103-runDuration .popover-trigger'));
        expect(popoverContent).to.equal('Duration based on o2 stop because of missing trigger stop information');
    });

    it('should successfully display popover warning when run is missing trigger start and stop', async () => {
        const popoverContent = await getPopoverContent(await page.waitForSelector('#row102-runDuration .popover-trigger'));
        expect(popoverContent).to.equal('Duration based on o2 start AND stop because of missing trigger information');
    });

    it('should successfully display links to infologger, QC GUI and ECS', async () => {
        const { id: createdRunId } = await runService.create({ runNumber: 1000, timeTrgStart: new Date(), environmentId: 'CmCvjNbg' });
        await waitForNavigation(page, () => pressElement(page, 'a#home'));
        await waitForNavigation(page, () => pressElement(page, 'a#run-overview'));

        // Not running run, wait for popover to be visible
        await pressElement(page, '#row104-runNumber-text .popover-trigger');
        let popoverSelector = await getPopoverSelector(await page.waitForSelector('#row104-runNumber-text .popover-trigger'));
        await page.waitForSelector(popoverSelector);

        await expectLink(page, `${popoverSelector} a:nth-of-type(1)`, {
            href: 'http://localhost:8081/?q={%22partition%22:{%22match%22:%22TDI59So3d%22},'
                  + '%22run%22:{%22match%22:%22104%22},%22severity%22:{%22in%22:%22W%20E%20F%22}}',
            innerText: 'Infologger FLP',
        });
        await expectLink(page, `${popoverSelector} a:nth-of-type(2)`, {
            href: 'http://localhost:8082/' +
                  '?page=layoutShow&runNumber=104&definition=COMMISSIONING&detector=CPV&pdpBeamType=cosmic&runType=COSMICS',
            innerText: 'QCG',
        });

        // Running run
        await pressElement(page, `#row${createdRunId}-runNumber-text .popover-trigger`);
        popoverSelector = await getPopoverSelector(await page.waitForSelector('#row109-runNumber-text .popover-trigger'));
        await page.waitForSelector(popoverSelector);

        await expectLink(page, `${popoverSelector} a:nth-of-type(3)`, {
            href: 'http://localhost:8080/?page=environment&id=CmCvjNbg',
            innerText: 'ECS',
        });
    });
};
