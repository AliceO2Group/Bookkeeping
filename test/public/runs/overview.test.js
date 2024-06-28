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
    focusAndType,
    waitForTableLength,
    waitForNavigation,
    waitForTableTotalRowsCountToEqual,
    expectInputValue,
    expectColumnValues,
    waitForEmptyTable,
    waitForDownload,
    expectUrlParams,
} = require('../defaults.js');
const { RunDefinition } = require('../../../lib/server/services/run/getRunDefinition.js');
const { RUN_QUALITIES, RunQualities } = require('../../../lib/domain/enums/RunQualities.js');
const { resetDatabaseContent } = require('../../utilities/resetDatabaseContent.js');

const { expect } = chai;

const EXPORT_RUNS_TRIGGER_SELECTOR = '#export-runs-trigger';

module.exports = () => {
    let page;
    let browser;

    let table;
    let firstRowId;
    const runNumberInputSelector = '.runNumber-filter input';

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

        await pressElement(page, '#openFilterToggle');
        await page.waitForSelector(runNumberInputSelector);

        // Run 106 has detectors and tags that overflow
        await page.type(runNumberInputSelector, '106');
        await waitForTableLength(page, 1);

        await checkColumnBalloon(page, 1, 2);
        await checkColumnBalloon(page, 1, 3);

        await pressElement(page, '#openFilterToggle');
        await page.waitForSelector(runNumberInputSelector);

        // Run 1 has eor reasons that overflow
        await page.type(runNumberInputSelector, '1');
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

        // Open filter toggle
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

        const filterInputSelectorPrefix = '#runDefinitionCheckbox';
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

            const definitions = await page.$$eval('tbody tr', (rows) => rows.map((row) => {
                const rowId = row.id;
                return document.querySelector(`#${rowId}-definition-text`).innerText.split('\n')[0];
            }));
            expect(definitions.length).to.equal(size);
            expect(definitions.every((definition) => authorizedRunDefinition.includes(definition))).to.be.true;
        };

        await pressElement(page, physicsFilterSelector, true);
        await checkTableSizeAndDefinition(4, [RunDefinition.Physics]);

        await pressElement(page, syntheticFilterSelector, true);
        await checkTableSizeAndDefinition(6, [RunDefinition.Physics, RunDefinition.Synthetic]);

        await pressElement(page, physicsFilterSelector, true);
        await checkTableSizeAndDefinition(2, [RunDefinition.Synthetic]);

        await pressElement(page, cosmicsFilterSelector, true);
        await checkTableSizeAndDefinition(4, [RunDefinition.Synthetic, RunDefinition.Cosmics]);

        await pressElement(page, syntheticFilterSelector, true);
        await checkTableSizeAndDefinition(2, [RunDefinition.Cosmics]);

        await pressElement(page, technicalFilterSelector, true);
        await checkTableSizeAndDefinition(3, [RunDefinition.Cosmics, RunDefinition.Technical]);

        await pressElement(page, cosmicsFilterSelector, true);
        await checkTableSizeAndDefinition(1, [RunDefinition.Technical]);

        await pressElement(page, calibrationFilterSelector, true);
        await checkTableSizeAndDefinition(2, [RunDefinition.Technical, RunDefinition.Calibration]);

        await pressElement(page, commissioningFilterSelector, true);
        await checkTableSizeAndDefinition(8, [RunDefinition.Commissioning]);

        await pressElement(page, commissioningFilterSelector, true);
        await pressElement(page, physicsFilterSelector, true);
        await pressElement(page, syntheticFilterSelector, true);
        await pressElement(page, cosmicsFilterSelector, true);

        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.runs.overviewModel.pagination.itemsPerPage = 20;
        });

        await waitForTableLength(page, 10);

        await checkTableSizeAndDefinition(
            10,
            [RunDefinition.Cosmics, RunDefinition.Technical, RunDefinition.Physics, RunDefinition.Synthetic, RunDefinition.Calibration],
        );
    });

    it('Should correctly set the the min/max of time range picker inputs', async () => {
        await goToPage(page, 'run-overview');

        // Open the filters
        await pressElement(page, '#openFilterToggle');

        await pressElement(page, '.timeO2Start-filter .popover-trigger');

        const o2StartPopoverSelector = await getPopoverSelector(await page.$('.timeO2Start-filter .popover-trigger'));
        const periodInputsSelectors = getPeriodInputsSelectors(o2StartPopoverSelector);

        await focusAndType(page, periodInputsSelectors.fromTimeSelector, '11:11AM');
        await focusAndType(page, periodInputsSelectors.toTimeSelector, '02:00PM');

        // American style input
        await focusAndType(page, periodInputsSelectors.fromDateSelector, '02/03/2021');
        await focusAndType(page, periodInputsSelectors.toDateSelector, '02/03/2021');

        await page.$eval(periodInputsSelectors.toDateSelector, (element) => element.blur());

        // Wait for page to be refreshed
        await page.waitForFunction(
            (selector) => document.querySelector(selector).getAttribute('min') !== '',
            { timeout: 500 },
            periodInputsSelectors.toTimeSelector,
        );

        expect(await page.$eval(periodInputsSelectors.toTimeSelector, (element) => element.getAttribute('min'))).to.equal('11:12');
        expect(await page.$eval(periodInputsSelectors.toDateSelector, (element) => element.getAttribute('min'))).to.equal('2021-02-03');

        expect(await page.$eval(periodInputsSelectors.fromTimeSelector, (element) => element.getAttribute('max'))).to.equal('13:59');
        expect(await page.$eval(periodInputsSelectors.fromDateSelector, (element) => element.getAttribute('max'))).to.equal('2021-02-03');

        // Setting different dates, still american style input
        await focusAndType(page, periodInputsSelectors.toDateSelector, '02/05/2021');

        await page.waitForFunction(
            (selector) => document.querySelector(selector).getAttribute('min') === '',
            { timeout: 500 },
            periodInputsSelectors.toTimeSelector,
        );
        expect(await page.$eval(periodInputsSelectors.toDateSelector, (element) => element.getAttribute('min'))).to.equal('2021-02-03');

        expect(await page.$eval(periodInputsSelectors.fromTimeSelector, (element) => element.getAttribute('max'))).to.equal('');
        expect(await page.$eval(periodInputsSelectors.fromDateSelector, (element) => element.getAttribute('max'))).to.equal('2021-02-05');

        await pressElement(page, '.timeO2Start-filter .popover-trigger');
    });

    it('should successfully filter on duration', async () => {
        await goToPage(page, 'run-overview');

        await pressElement(page, '#openFilterToggle');
        await page.waitForSelector('#duration-operator');

        const runDurationOperatorSelector = '#duration-operator';
        const runDurationOperator = await page.$(runDurationOperatorSelector) || null;
        expect(runDurationOperator).to.not.be.null;
        expect(await runDurationOperator.evaluate((element) => element.value)).to.equal('=');

        const runDurationLimitSelector = '#duration-limit';
        const runDurationLimit = await page.$(runDurationLimitSelector) || null;

        await page.waitForSelector(runDurationLimitSelector);
        expect(runDurationLimit).to.not.be.null;

        await page.focus(runDurationLimitSelector);
        await page.keyboard.type('1500');
        await waitForTableLength(page, 3);

        await page.select(runDurationOperatorSelector, '=');
        await waitForTableLength(page, 3);

        let runDurationList = await page.evaluate(() => Array.from(document.querySelectorAll('tbody tr')).map((row) => {
            const rowId = row.id;
            return document.querySelector(`#${rowId}-runDuration-text`)?.innerText;
        }));

        expect(runDurationList.every((runDuration) => {
            const time = runDuration.replace('*', '');
            return time === '25:00:00';
        })).to.be.true;

        await page.$eval(runDurationLimitSelector, (input) => {
            input.value = '';
        });
        await page.focus(runDurationLimitSelector);
        await page.keyboard.type('3000');
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

    it('Should successfully filter runs by their run quality', async () => {
        await goToPage(page, 'run-overview');
        const filterInputSelectorPrefix = '#runQualityCheckbox';
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
         * @return {void}
         */
        const filterOnRun = async () => {
            await page.waitForSelector(runNumberInputSelector);
            expect(await page.$eval(runNumberInputSelector, (input) => input.placeholder)).to.equal('e.g. 534454, 534455...');
            await fillInput(page, runNumberInputSelector, inputValue);
            await waitForTableLength(page, 2);
            // Validate amount in the table
            const table = await page.$$('tbody tr');
            expect(table.length).to.equal(2);
            expect(await page.$$eval('tbody tr', (rows) => rows.map((row) => row.id))).to.eql(['row102', 'row101']);
        };

        // First filter validation on the main page.
        await filterOnRun();

        // Validate if the filter tab value is equal to the main page value.
        await page.$eval('#openFilterToggle', (element) => element.click());
        expect(await page.$eval(runNumberInputSelector, (input) => input.value)).to.equal(inputValue);

        // Test if it works in the filter tab.
        await goToPage(page, 'run-overview');
        await page.$eval('#openFilterToggle', (element) => element.click());

        // Run the same test sequence on the filter tab.
        await filterOnRun();
    });

    it('should successfully filter on a single run number and inform the user about it', async () => {
        const inputValue = '10';
        await goToPage(page, 'run-overview');

        /**
         * This is the sequence to test filtering the runs on run numbers.
         * @return {void}
         */
        const filterOnRun = async () => {
            await page.waitForSelector(runNumberInputSelector);
            expect(await page.$eval(runNumberInputSelector, (input) => input.placeholder)).to.equal('e.g. 534454, 534455...');
            await fillInput(page, runNumberInputSelector, inputValue);
            await waitForTableLength(page, 8);
            // Validate amount in the first page table
            const firstPageTable = await page.$$('tbody tr');
            expect(firstPageTable.length).to.equal(8);

            const firstPageRows = ['row108', 'row107', 'row106', 'row105', 'row104', 'row103', 'row102', 'row101'];
            expect(await page.$$eval('tbody tr', (rows) => rows.map((row) => row.id))).to.eql(firstPageRows);

            await page.$eval('#pageMoveRight', (element) => element.click());
            await waitForTableLength(page, 2);

            // Validate amount in the second page table
            const secondPageTable = await page.$$('tbody tr');
            expect(secondPageTable.length).to.equal(2);

            const secondPageRows = ['row100', 'row10'];
            expect(await page.$$eval('tbody tr', (rows) => rows.map((row) => row.id))).to.eql(secondPageRows);
        };

        // First filter validation on the main page.
        await filterOnRun();

        // Validate if the filter tab value is equal to the main page value.
        await page.$eval('#openFilterToggle', (element) => element.click());
        await page.waitForSelector('#eorCategories');
        expect(await page.$eval(runNumberInputSelector, (input) => input.value)).to.equal(inputValue);

        // Test if it works in the filter tab.
        await goToPage(page, 'run-overview');
        await page.$eval('#openFilterToggle', (element) => element.click());
        await page.waitForSelector('#eorCategories');

        // Run the same test sequence on the filter tab.
        await filterOnRun();
    });

    it('should successfully filter on a list of fill numbers and inform the user about it', async () => {
        await goToPage(page, 'run-overview');
        await page.evaluate(() => window.model.disableInputDebounce());
        await waitForTableLength(page, 8);

        await pressElement(page, '#openFilterToggle');

        const filterInputSelector = '#fillNumbers';
        expect(await page.$eval(filterInputSelector, (input) => input.placeholder)).to.equal('e.g. 7966, 7954, 7948...');

        await fillInput(page, filterInputSelector, '1, 3');
        await waitForTableLength(page, 6);

        await pressElement(page, '#reset-filters');
    });

    it('should successfully filter on a list of environment ids and inform the user about it', async () => {
        await waitForTableLength(page, 8);

        const filterInputSelector = '#environmentIds';
        expect(await page.$eval(filterInputSelector, (input) => input.placeholder)).to.equal('e.g. Dxi029djX, TDI59So3d...');

        await fillInput(page, filterInputSelector, 'Dxi029djX, TDI59So3d');
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
        await fillInput(page, '#nDetectors-limit', '1');
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
        await fillInput(page, '#nFlps-limit', '10');
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
        await fillInput(page, '#nEpns-limit', '10');
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

        // Expect the EOR description filter to exist
        const eorDescriptionInput = await page.$('#eorDescription');
        expect(eorDescriptionInput).to.exist;

        // Expect there to be one result that contains a certain description
        await page.focus('#eorDescription');
        const descriptionInput = 'some';
        await page.keyboard.type(descriptionInput);
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
        await page.click('#reset-filters');
        await waitForTableLength(page, 8);
        eorReasons = await page.$$('table td[id$="eorReasons"]');
        expect(eorReasons.length).to.be.greaterThan(1);

        const inputText = await (await eorDescriptionInput.getProperty('value')).jsonValue();
        expect(inputText).to.equal('');

        await pressElement(page, '#reset-filters');
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
        await fillInput(page, runNumberInputSelector, '99999999999');
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
        const filterInputSelectorPrefix = '#runQualityCheckbox';
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

    it('should successfully display links to infologger and QC GUI', async () => {
        await pressElement(page, '#row104-runNumber-text .popover-trigger');
        const popoverSelector = await getPopoverSelector(await page.waitForSelector('#row104-runNumber-text .popover-trigger'));
        await page.waitForSelector(popoverSelector);
        expect(await page.$eval(
            `${popoverSelector} a`,
            ({ href }) => href,
        )).to.equal('http://localhost:8081/?q={%22run%22:{%22match%22:%22104%22},%22severity%22:{%22in%22:%22W%20E%20F%22}}');
        expect(await page.$eval(
            `${popoverSelector} a:nth-child(3)`,
            ({ href }) => href,
            // eslint-disable-next-line max-len
        )).to.equal('http://localhost:8082/' +
            '?page=layoutShow&runNumber=104&definition=COMMISSIONING&detector=CPV&pdpBeamType=cosmic&runType=COSMICS');
    });
};
