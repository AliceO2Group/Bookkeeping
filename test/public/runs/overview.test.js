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
    waitForNetworkIdleAndRedraw,
} = require('../defaults');
const { RunDefinition } = require('../../../lib/server/services/run/getRunDefinition.js');
const { RUN_QUALITIES, RunQualities } = require('../../../lib/domain/enums/RunQualities.js');
const { fillInput, getPopoverContent, getInnerText, waitForTimeout } = require('../defaults.js');
const { waitForDownload } = require('../../utilities/waitForDownload');

const { expect } = chai;

module.exports = () => {
    let page;
    let browser;

    let table;
    let firstRowId;
    const runNumberInputSelector = '.runNumber-filter input';
    const timeFilterSelectors = {
        startFrom: '#o2startFilterFromTime',
        startTo: '#o2startFilterToTime',
        endFrom: '#o2endFilterFromTime',
        endTo: '#o2endFilterToTime',
    };
    const dateFilterSelectors = {
        startFrom: '#o2startFilterFrom',
        startTo: '#o2startFilterTo',
        endFrom: '#o2endFilterFrom',
        endTo: '#o2endFilterTo',
    };

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
        await waitForTimeout(100);

        expect(await page.$eval('#firstRowIndex', (element) => parseInt(element.innerText, 10))).to.equal(1);
        expect(await page.$eval('#lastRowIndex', (element) => parseInt(element.innerText, 10))).to.equal(8);
        expect(await page.$eval('#totalRowsCount', (element) => parseInt(element.innerText, 10))).to.equal(108);
    });

    it('successfully switch to raw timestamp display', async () => {
        const rawTimestampToggleSelector = '#preferences-raw-timestamps';
        expect(await page.evaluate(() => document.querySelector('#row106 td:nth-child(6)').innerText)).to.equal('08/08/2019\n13:00:00');
        expect(await page.evaluate(() => document.querySelector('#row106 td:nth-child(7)').innerText)).to.equal('09/08/2019\n14:00:00');
        await page.$eval(rawTimestampToggleSelector, (element) => element.click());
        expect(await page.evaluate(() => document.querySelector('#row106 td:nth-child(6)').innerText)).to.equal('1565269200000');
        expect(await page.evaluate(() => document.querySelector('#row106 td:nth-child(7)').innerText)).to.equal('1565359200000');
        // Go back to normal
        await page.$eval(rawTimestampToggleSelector, (element) => element.click());
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
        await waitForTimeout(600);

        // Expect the amount of visible runs to reduce when the first option (5) is selected
        const tableRows = await page.$$('table tr');
        expect(tableRows.length - 1).to.equal(5);

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

    it('dynamically switches between visible pages in the page selector', async () => {
        // Override the amount of runs visible per page manually
        await goToPage(page, 'run-overview');
        await waitForTimeout(100);
        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.runs.overviewModel.pagination.itemsPerPage = 1;
        });
        await waitForTimeout(100);

        // Expect the page five button to now be visible, but no more than that
        const pageFiveButton = await page.$('#page5');
        expect(Boolean(pageFiveButton)).to.be.true;
        const pageSixButton = await page.$('#page6');
        expect(Boolean(pageSixButton)).to.be.false;

        // Expect the page one button to have fallen away when clicking on page five button
        await pressElement(page, '#page5');
        await waitForTimeout(100);
        const pageOneButton = await page.$('#page1');
        expect(Boolean(pageOneButton)).to.be.false;
    });

    it('notifies if table loading returned an error', async () => {
        await goToPage(page, 'run-overview');
        await waitForTimeout(100);
        // eslint-disable-next-line no-return-assign, no-undef
        await page.evaluate(() => model.runs.overviewModel.pagination.itemsPerPage = 200);
        await waitForTimeout(100);

        // We expect there to be a fitting error message
        const expectedMessage = 'Invalid Attribute: "query.page.limit" must be less than or equal to 100';
        await expectInnerText(page, '.alert-danger', expectedMessage);

        // Revert changes for next test
        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.runs.overviewModel.pagination.itemsPerPage = 10;
        });
        await waitForTimeout(100);
    });

    it('can navigate to a run detail page', async () => {
        await goToPage(page, 'run-overview');
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

    it('Should have balloon on detector, tags and eor column', async () => {
        await goToPage(page, 'run-overview');
        await waitForTimeout(100);

        await pressElement(page, '#openFilterToggle');
        await waitForTimeout(200);

        // Run 106 has detectors and tags that overflow
        await page.type(runNumberInputSelector, '106');
        await waitForTimeout(500);

        await checkColumnBalloon(page, 1, 2);
        await checkColumnBalloon(page, 1, 3);

        await pressElement(page, '#openFilterToggle');
        await waitForTimeout(200);

        // Run 1 has eor reasons that overflow
        await page.type(runNumberInputSelector, '1');
        await waitForTimeout(500);

        await checkColumnBalloon(page, 1, 16);
    });

    it('Should display balloon if the text overflows', async () => {
        await goToPage(page, 'run-overview');

        await checkColumnBalloon(page, 1, 2);
    });

    it('should successfully filter on detectors', async () => {
        await goToPage(page, 'run-overview');

        // Open filter toggle
        await pressElement(page, '#openFilterToggle');
        await waitForTimeout(200);

        await page.$eval('.detectors-filter .dropdown-trigger', (element) => element.click());
        await pressElement(page, '#detector-filter-dropdown-option-ITS');
        await pressElement(page, '#detector-filter-dropdown-option-FT0');
        await waitForTimeout(300);

        table = await page.$$('tbody tr');
        expect(table.length).to.equal(4);

        await page.$eval('#detector-filter-combination-operator-radio-button-or', (element) => element.click());
        await waitForTimeout(300);

        table = await page.$$('tbody tr');
        expect(table.length).to.equal(8);

        await page.$eval('#detector-filter-combination-operator-radio-button-none', (element) => element.click());
        await waitForTimeout(300);

        table = await page.$$('tbody tr');
        expect(table.length).to.equal(2);
    });

    it('should successfully filter on definition', async () => {
        await goToPage(page, 'run-overview');
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
         * @param {{evaluate: function}[]} rows the list of rows
         * @param {string[]} authorizedRunDefinition  the list of valid run qualities
         * @return {void}
         */
        const checkTableRunDefinitions = async (rows, authorizedRunDefinition) => {
            for (const row of rows) {
                expect(await row.evaluate((rowItem) => {
                    const rowId = rowItem.id;
                    return document.querySelector(`#${rowId}-definition-text`).innerText.split('\n')[0];
                })).to.be.oneOf(authorizedRunDefinition);
            }
        };

        // Open filter toggle
        await pressElement(page, '#openFilterToggle');
        await waitForTimeout(200);

        await page.$eval(physicsFilterSelector, (element) => element.click());
        await waitForTimeout(300);
        table = await page.$$('tbody tr');
        expect(table.length).to.equal(4);
        await checkTableRunDefinitions(table, [RunDefinition.Physics]);

        await page.$eval(syntheticFilterSelector, (element) => element.click());
        await waitForTimeout(300);
        table = await page.$$('tbody tr');
        expect(table.length).to.equal(6);
        await checkTableRunDefinitions(table, [RunDefinition.Physics, RunDefinition.Synthetic]);

        await page.$eval(physicsFilterSelector, (element) => element.click());
        await waitForTimeout(300);
        table = await page.$$('tbody tr');
        expect(table.length).to.equal(2);
        await checkTableRunDefinitions(table, [RunDefinition.Synthetic]);

        await page.$eval(cosmicsFilterSelector, (element) => element.click());
        await waitForTimeout(300);
        table = await page.$$('tbody tr');
        expect(table.length).to.equal(4);
        await checkTableRunDefinitions(table, [RunDefinition.Synthetic, RunDefinition.Cosmics]);

        await page.$eval(syntheticFilterSelector, (element) => element.click());
        await waitForTimeout(300);
        table = await page.$$('tbody tr');
        expect(table.length).to.equal(2);
        await checkTableRunDefinitions(table, [RunDefinition.Cosmics]);

        await page.$eval(technicalFilterSelector, (element) => element.click());
        await waitForTimeout(300);
        table = await page.$$('tbody tr');
        expect(table.length).to.equal(3);
        await checkTableRunDefinitions(table, [RunDefinition.Cosmics, RunDefinition.Technical]);

        await page.$eval(cosmicsFilterSelector, (element) => element.click());
        await waitForTimeout(300);
        table = await page.$$('tbody tr');
        expect(table.length).to.equal(1);
        await checkTableRunDefinitions(table, [RunDefinition.Technical]);

        await page.$eval(calibrationFilterSelector, (element) => element.click());
        await waitForTimeout(300);
        table = await page.$$('tbody tr');
        expect(table.length).to.equal(2);
        await checkTableRunDefinitions(table, [RunDefinition.Technical, RunDefinition.Calibration]);

        await page.$eval(commissioningFilterSelector, (element) => element.click());
        await waitForTimeout(300);
        table = await page.$$('tbody tr');
        await checkTableRunDefinitions(table, [RunDefinition.Commissioning]);
        await page.$eval(commissioningFilterSelector, (element) => element.click());
        await waitForTimeout(300);

        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.runs.overviewModel.pagination.itemsPerPage = 20;
        });
        await waitForTimeout(100);

        await page.$eval(physicsFilterSelector, (element) => element.click());
        await page.$eval(syntheticFilterSelector, (element) => element.click());
        await page.$eval(cosmicsFilterSelector, (element) => element.click());
        await waitForTimeout(300);
        table = await page.$$('tbody tr');
        expect(table.length).to.equal(10);
        await checkTableRunDefinitions(
            table,
            [RunDefinition.Cosmics, RunDefinition.Technical, RunDefinition.Physics, RunDefinition.Synthetic, RunDefinition.Calibration],
        );
    });

    it('should update to current date when empty and time is set', async () => {
        await goToPage(page, 'run-overview');
        waitForTimeout(100);
        // Open the filters
        await pressElement(page, '#openFilterToggle');
        await waitForTimeout(200);
        let today = new Date();
        today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
        [today] = today.toISOString().split('T');
        const time = '00:01';

        for (const selector of Object.values(timeFilterSelectors)) {
            await page.type(selector, time);
            await waitForTimeout(300);
        }
        for (const selector of Object.values(dateFilterSelectors)) {
            const value = await page.$eval(selector, (element) => element.value);
            expect(String(value)).to.equal(today);
        }
        const date = new Date();
        const now = `${date.getHours()}:${(date.getMinutes() < 10 ? '0' : '') + date.getMinutes()}`;
        const firstTill = await page.$eval(timeFilterSelectors.startFrom, (element) => element.getAttribute('max'));
        const secondTill = await page.$eval(timeFilterSelectors.endFrom, (element) => element.getAttribute('max'));
        expect(String(firstTill)).to.equal(now);
        expect(String(secondTill)).to.equal(now);
    });
    it('Validates date will not be set again', async () => {
        await goToPage(page, 'run-overview');
        waitForTimeout(100);
        const dateString = '03-21-2021';
        const validValue = '2021-03-21';
        // Open the filters
        await pressElement(page, '#openFilterToggle');
        await waitForTimeout(200);
        // Set date
        for (const key in dateFilterSelectors) {
            await page.focus(dateFilterSelectors[key]);
            await page.keyboard.type(dateString);
            await waitForTimeout(500);
            await page.focus(timeFilterSelectors[key]);
            await page.keyboard.type('00-01-AM');
            await waitForTimeout(500);
            const value = await page.$eval(dateFilterSelectors[key], (element) => element.value);
            expect(value).to.equal(validValue);
        }
    });
    it('The max/min should be the right value when date is set to same day', async () => {
        await goToPage(page, 'run-overview');
        waitForTimeout(100);
        const dateString = '03-02-2021';
        // Open the filters
        await pressElement(page, '#openFilterToggle');
        await waitForTimeout(200);
        // Set date to an open day
        for (const selector of Object.values(dateFilterSelectors)) {
            await page.type(selector, dateString);
            await waitForTimeout(300);
        }
        await page.type(timeFilterSelectors.startFrom, '11:11');
        await page.type(timeFilterSelectors.startTo, '14:00');
        await page.type(timeFilterSelectors.endFrom, '11:11');
        await page.type(timeFilterSelectors.endTo, '14:00');
        await waitForTimeout(500);

        // Validate if the max value is the same as the till values
        const startMax = await page.$eval(timeFilterSelectors.startFrom, (element) => element.getAttribute('max'));
        const endMax = await page.$eval(timeFilterSelectors.endFrom, (element) => element.getAttribute('max'));
        expect(String(startMax)).to.equal(await page.$eval(timeFilterSelectors.startTo, (element) => element.value));
        expect(String(endMax)).to.equal(await page.$eval(timeFilterSelectors.endTo, (element) => element.value));

        // Validate if the min value is the same as the from values
        const startMin = await page.$eval(timeFilterSelectors.startTo, (element) => element.getAttribute('min'));
        const endMin = await page.$eval(timeFilterSelectors.endTo, (element) => element.getAttribute('min'));
        expect(String(startMin)).to.equal(await page.$eval(timeFilterSelectors.startFrom, (element) => element.value));
        expect(String(endMin)).to.equal(await page.$eval(timeFilterSelectors.endFrom, (element) => element.value));
    });

    it('The max should be the maximum value when having different dates', async () => {
        await goToPage(page, 'run-overview');
        waitForTimeout(100);
        const dateString = '03-20-2021';
        const maxTime = '23:59';
        const minTime = '00:00';
        // Open the filters
        await pressElement(page, '#openFilterToggle');
        await waitForTimeout(200);
        // Set date to an open day
        for (const selector of Object.values(dateFilterSelectors)) {
            await page.type(selector, dateString);
            await waitForTimeout(500);
        }
        const startMax = await page.$eval(timeFilterSelectors.startFrom, (element) => element.getAttribute('max'));
        const endMax = await page.$eval(timeFilterSelectors.endFrom, (element) => element.getAttribute('max'));
        expect(String(startMax)).to.equal(maxTime);
        expect(String(endMax)).to.equal(maxTime);

        // Validate if the min value is the same as the from values
        const startMin = await page.$eval(timeFilterSelectors.startTo, (element) => element.getAttribute('min'));
        const endMin = await page.$eval(timeFilterSelectors.endTo, (element) => element.getAttribute('min'));
        expect(String(startMin)).to.equal(minTime);
        expect(String(endMin)).to.equal(minTime);
    });

    it('should successfully filter on duration', async () => {
        await goToPage(page, 'run-overview');
        waitForTimeout(100);

        await pressElement(page, '#openFilterToggle');
        await waitForTimeout(200);

        const runDurationOperatorSelector = '#duration-operator';
        const runDurationOperator = await page.$(runDurationOperatorSelector) || null;
        expect(runDurationOperator).to.not.be.null;
        expect(await runDurationOperator.evaluate((element) => element.value)).to.equal('=');

        const runDurationLimitSelector = '#duration-limit';
        const runDurationLimit = await page.$(runDurationLimitSelector) || null;
        expect(runDurationLimit).to.not.be.null;

        await page.focus(runDurationLimitSelector);
        await page.keyboard.type('1500');
        await waitForTimeout(300);

        await page.select(runDurationOperatorSelector, '=');
        await waitForTimeout(300);

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
        await waitForTimeout(300);

        await page.select(runDurationOperatorSelector, '>=');
        await waitForTimeout(300);

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
        await waitForTimeout(200);

        await page.$eval(badFilterSelector, (element) => element.click());
        await waitForTimeout(300);
        table = await page.$$('tbody tr');
        expect(table.length).to.equal(2);
        await checkTableRunQualities(table, [RunQualities.BAD]);

        await page.$eval(testFilterSelector, (element) => element.click());
        await waitForTimeout(300);
        table = await page.$$('tbody tr');
        await checkTableRunQualities(table, [RunQualities.BAD, RunQualities.TEST]);

        await page.$eval(testFilterSelector, (element) => element.click());
        await waitForTimeout(300);
        table = await page.$$('tbody tr');
        expect(table.length).to.equal(2);
        await checkTableRunQualities(table, [RunQualities.BAD]);
    });

    it('Should successfully filter runs by their trigger value', async () => {
        await goToPage(page, 'run-overview');
        const filterInputSelectorPrefix = '#triggerValueCheckbox';
        const offFilterSelector = `${filterInputSelectorPrefix}OFF`;
        const ltuFilterSelector = `${filterInputSelectorPrefix}LTU`;

        /**
         * Checks that all the rows of the given table have a valid trigger value
         *
         * @param {{evaluate: function}[]} rows the list of rows
         * @param {string[]} authorizedRunQualities  the list of valid run qualities
         * @return {void}
         */
        const checkTableRunQualities = async (rows, authorizedRunQualities) => {
            for (const row of rows) {
                expect(await row.evaluate((rowItem) => {
                    const rowId = rowItem.id;
                    return document.querySelector(`#${rowId}-triggerValue-text`).innerText;
                })).to.be.oneOf(authorizedRunQualities);
            }
        };

        // Open filter toggle
        await pressElement(page, '#openFilterToggle');
        await waitForTimeout(200);

        await page.$eval(offFilterSelector, (element) => element.click());
        await waitForTimeout(300);
        table = await page.$$('tbody tr');

        expect(table.length).to.equal(8);
        await checkTableRunQualities(table, ['OFF']);

        await page.$eval(ltuFilterSelector, (element) => element.click());
        await waitForTimeout(300);
        table = await page.$$('tbody tr');
        await checkTableRunQualities(table, ['OFF', 'LTU']);

        await page.$eval(ltuFilterSelector, (element) => element.click());
        await waitForTimeout(300);
        table = await page.$$('tbody tr');

        expect(table.length).to.equal(8);

        await checkTableRunQualities(table, ['OFF']);
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
            await waitForTimeout(500);
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
            await waitForTimeout(500);
            // Validate amount in the first page table
            const firstPageTable = await page.$$('tbody tr');
            expect(firstPageTable.length).to.equal(8);

            const firstPageRows = ['row108', 'row107', 'row106', 'row105', 'row104', 'row103', 'row102', 'row101'];
            expect(await page.$$eval('tbody tr', (rows) => rows.map((row) => row.id))).to.eql(firstPageRows);

            await page.$eval('#pageMoveRight', (element) => element.click());
            await waitForTimeout(500);

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
        expect(await page.$eval(runNumberInputSelector, (input) => input.value)).to.equal(inputValue);

        // Test if it works in the filter tab.
        await goToPage(page, 'run-overview');
        await page.$eval('#openFilterToggle', (element) => element.click());

        // Run the same test sequence on the filter tab.
        await filterOnRun();
    });

    it('should successfully filter on a list of fill numbers and inform the user about it', async () => {
        await goToPage(page, 'run-overview');
        await page.evaluate(() => window.model.disableInputDebounce());

        await page.$eval('#openFilterToggle', (element) => element.click());

        const filterInputSelector = '#fillNumbers';
        expect(await page.$eval(filterInputSelector, (input) => input.placeholder)).to.equal('e.g. 7966, 7954, 7948...');

        await fillInput(page, filterInputSelector, '1, 3');
        await waitForNetworkIdleAndRedraw(page);

        table = await page.$$('tbody tr');
        expect(table.length).to.equal(6);
    });

    it('should successfully filter on a list of environment ids and inform the user about it', async () => {
        await goToPage(page, 'run-overview');
        await page.evaluate(() => window.model.disableInputDebounce());

        await page.$eval('#openFilterToggle', (element) => element.click());

        const filterInputSelector = '#environmentIds';
        expect(await page.$eval(filterInputSelector, (input) => input.placeholder)).to.equal('e.g. Dxi029djX, TDI59So3d...');

        await fillInput(page, filterInputSelector, 'Dxi029djX, TDI59So3d');
        await waitForNetworkIdleAndRedraw(page);

        table = await page.$$('tbody tr');
        expect(table.length).to.equal(6);
    });

    it('should successfully filter on run types', async () => {
        await goToPage(page, 'run-overview');
        await waitForTimeout(100);

        await pressElement(page, '#openFilterToggle');
        await waitForTimeout(100);

        await pressElement(page, '.runType-filter .dropdown-trigger');
        await waitForTimeout(100);

        await pressElement(page, '#run-types-dropdown-option-2');
        await pressElement(page, '#run-types-dropdown-option-14');

        await waitForNetworkIdleAndRedraw(page);

        table = await page.$$('tbody tr');
        expect(table.length).to.equal(5);
    });

    it('should successfully filter on nDetectors', async () => {
        await goToPage(page, 'run-overview');
        waitForTimeout(100);

        await pressElement(page, '#openFilterToggle');
        await waitForTimeout(200);

        const nDetectorOperatorSelector = '#nDetectors-operator';
        const nDetectorOperator = await page.$(nDetectorOperatorSelector) || null;
        expect(nDetectorOperator).to.not.be.null;
        expect(await nDetectorOperator.evaluate((element) => element.value)).to.equal('=');

        const nDetectorLimitSelector = '#nDetectors-limit';
        const nDetectorLimit = await page.$(nDetectorLimitSelector) || null;
        expect(nDetectorLimit).to.not.be.null;

        await nDetectorLimit.focus();
        await page.keyboard.type('3');
        await waitForTimeout(300);
        await page.select(nDetectorOperatorSelector, '<=');
        await waitForTimeout(300);

        const nDetectorsList = await page.evaluate(() => Array.from(document.querySelectorAll('tbody tr')).map((row) => {
            const rowId = row.id;
            return document.querySelector(`#${rowId}-detectors .nDetectors-badge`)?.innerText;
        }));

        // The nDetectors can be null if the detectors' field is null but the nDetectors is not, which can be added in tests data
        expect(nDetectorsList.every((nDetectors) => parseInt(nDetectors, 10) <= 3 || nDetectors === null)).to.be.true;
    });

    it('should successfully filter on nFLPs', async () => {
        await goToPage(page, 'run-overview');
        waitForTimeout(100);

        await pressElement(page, '#openFilterToggle');
        await waitForTimeout(200);

        const nFlpsOperatorSelector = '#nFlps-operator';
        const nFlpsOperator = await page.$(nFlpsOperatorSelector) || null;
        expect(nFlpsOperator).to.not.be.null;
        expect(await nFlpsOperator.evaluate((element) => element.value)).to.equal('=');

        const nFlpsLimitSelector = '#nFlps-limit';
        const nFlpsLimit = await page.$(nFlpsLimitSelector) || null;
        expect(nFlpsLimit).to.not.be.null;

        await nFlpsLimit.focus();
        await page.keyboard.type('10');
        await waitForTimeout(300);
        await page.select(nFlpsOperatorSelector, '<=');
        await waitForTimeout(300);

        const nFlpsList = await page.evaluate(() => Array.from(document.querySelectorAll('tbody tr')).map((row) => {
            const rowId = row.id;
            return document.querySelector(`#${rowId}-nFlps-text`)?.innerText;
        }));
        expect(nFlpsList.every((nFlps) => parseInt(nFlps, 10) <= 10)).to.be.true;
    });

    it('should successfully filter on nEPNs', async () => {
        await goToPage(page, 'run-overview');
        await page.waitForSelector('#openFilterToggle');

        await pressElement(page, '#openFilterToggle');
        await page.waitForSelector('#nEpns-operator');
        await page.waitForSelector('#nEpns-limit');

        const nEpnsOperatorSelector = '#nEpns-operator';
        const nEpnsOperator = await page.$(nEpnsOperatorSelector) || null;
        expect(nEpnsOperator).to.not.be.null;
        expect(await nEpnsOperator.evaluate((element) => element.value)).to.equal('=');

        const nEpnsLimitSelector = '#nEpns-limit';
        const nEpnsLimit = await page.$(nEpnsLimitSelector) || null;
        expect(nEpnsLimit).to.not.be.null;

        await nEpnsLimit.focus();
        await page.keyboard.type('10');
        await waitForNetworkIdleAndRedraw(page);
        await page.select(nEpnsOperatorSelector, '<=');
        await waitForNetworkIdleAndRedraw(page);

        const nEpnsList = await page.evaluate(() => Array.from(document.querySelectorAll('tbody tr')).map((row) => {
            const rowId = row.id;
            return document.querySelector(`#${rowId}-nEpns-text`)?.innerText;
        }));
        expect(nEpnsList.every((nEpns) => parseInt(nEpns, 10) <= 10 || nEpns === 'OFF')).to.be.true;
    });

    it('should successfully filter on EPN on/off', async () => {
        await goToPage(page, 'run-overview');
        await page.waitForSelector('#openFilterToggle');

        await pressElement(page, '#openFilterToggle');
        await page.waitForSelector('#epnFilterRadioOFF');

        await pressElement(page, '#epnFilterRadioOFF');
        await waitForNetworkIdleAndRedraw(page);

        const table = await page.$$('tbody tr');
        expect(table.length).to.equal(2);
    });

    it('should successfully filter by EOR Reason types', async () => {
        await goToPage(page, 'run-overview');
        waitForTimeout(100);

        await pressElement(page, '#openFilterToggle');
        await waitForTimeout(200);

        // Expect the EOR filter to exist
        const eorCategoryDropdown = await page.$('#eorCategories');
        expect(eorCategoryDropdown).to.exist;
        const eorTitleDropdown = await page.$('#eorTitles');
        expect(eorTitleDropdown).to.exist;

        // Select the EOR reason category DETECTORS
        await page.select('#eorCategories', 'DETECTORS');
        await waitForTimeout(500);
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
        await waitForTimeout(500);

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
        await waitForTimeout(500);
        detectorTitleElements = await eorTitleDropdown.$$('option');
        expect(detectorTitleElements).has.lengthOf(1);

        // There should be many items in the run details table
        eorReasons = await page.$$('table td[id$="eorReasons"]');
        expect(eorReasons.length).to.be.greaterThan(3);
    });

    it('should correctly filter by EOR reason description', async () => {
        await goToPage(page, 'run-overview');
        waitForTimeout(100);

        await pressElement(page, '#openFilterToggle');
        await waitForTimeout(200);

        // Expect the EOR description filter to exist
        const eorDescriptionInput = await page.$('#eorDescription');
        expect(eorDescriptionInput).to.exist;

        // Expect there to be one result that contains a certain description
        await page.focus('#eorDescription');
        const descriptionInput = 'some';
        await page.keyboard.type(descriptionInput);
        await waitForTimeout(500);

        let eorReasons = await page.$$('table td[id$="eorReasons"]');
        expect(eorReasons).has.lengthOf(2);
        const eorReasonText = await (await eorReasons[0].getProperty('innerText')).jsonValue();
        expect(eorReasonText.toLowerCase()).to.include(descriptionInput);

        // Assuming this result had the category DETECTORS, when we select a different category it should disappear.
        await page.select('#eorCategories', 'OTHER');
        await waitForTimeout(500);
        eorReasons = await page.$$('table td[id$="eorReasons"]');
        expect(eorReasons).has.lengthOf(0);

        // When we reset the filters, the input field should be empty
        await page.click('#reset-filters');
        await waitForTimeout(500);
        eorReasons = await page.$$('table td[id$="eorReasons"]');
        expect(eorReasons.length).to.be.greaterThan(1);

        const inputText = await (await eorDescriptionInput.getProperty('value')).jsonValue();
        expect(inputText).to.equal('');
    });

    const EXPORT_RUNS_TRIGGER_SELECTOR = '#export-runs-trigger';

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
        await waitForTimeout(100);
        exportModal = await page.$('#export-runs-modal');

        expect(exportModal).to.not.be.null;
    });

    it('should successfully display information when export will be truncated', async () => {
        await goToPage(page, 'run-overview');
        await waitForTimeout(200);

        await page.$eval(EXPORT_RUNS_TRIGGER_SELECTOR, (button) => button.click());
        await waitForTimeout(100);

        const truncatedExportWarning = await page.$('#export-runs-modal #truncated-export-warning');
        expect(truncatedExportWarning).to.not.be.null;
        expect(await truncatedExportWarning.evaluate((warning) => warning.innerText)).to
            .equal('The runs export is limited to 100 entries, only the last runs will be exported (sorted by run number)');
    });

    it('should successfully display disabled runs export button when there is no runs available', async () => {
        await goToPage(page, 'run-overview');
        await waitForTimeout(200);

        await pressElement(page, '#openFilterToggle');
        await waitForTimeout(200);

        // Type a fake run number to have no runs
        await page.focus(runNumberInputSelector);
        await page.keyboard.type('99999999999');
        await waitForTimeout(300);

        await pressElement(page, '#openFilterToggle');

        expect(await page.$eval(EXPORT_RUNS_TRIGGER_SELECTOR, (button) => button.disabled)).to.be.true;
    });

    it('should successfully export filtered runs', async () => {
        await goToPage(page, 'run-overview');

        const downloadPath = path.resolve('./download');

        // Check accessibility on frontend
        const session = await page.target().createCDPSession();
        await session.send('Browser.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath: downloadPath,
            eventsEnabled: true,
        });

        let downloadFilesNames;
        const targetFileName = 'runs.json';
        let runs;
        let exportModal;

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
        downloadFilesNames = fs.readdirSync(downloadPath);
        expect(downloadFilesNames.filter((name) => name == targetFileName)).to.be.lengthOf(1);
        runs = JSON.parse(fs.readFileSync(path.resolve(downloadPath, targetFileName)));

        expect(runs).to.be.lengthOf(100);
        expect(runs.every(({ runQuality, runNumber, ...otherProps }) =>
            runQuality && runNumber && Object.keys(otherProps).length === 0)).to.be.true;
        fs.unlinkSync(path.resolve(downloadPath, targetFileName));

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
        expect(exportModal).to.not.be.null;

        await page.waitForSelector('.form-control');
        await page.select('.form-control', 'runQuality', 'runNumber');
        await page.waitForSelector('#send:enabled');
        await page.$eval('#send', (button) => button.click());

        await waitForDownload(session);

        // Check download
        downloadFilesNames = fs.readdirSync(downloadPath);
        expect(downloadFilesNames.filter((name) => name == targetFileName)).to.be.lengthOf(1);
        runs = JSON.parse(fs.readFileSync(path.resolve(downloadPath, targetFileName)));
        expect(runs).to.have.all.deep.members([{ runNumber: 2, runQuality: 'bad' }, { runNumber: 1, runQuality: 'bad' }]);
    });

    it('should successfully navigate to the LHC fill details page', async () => {
        await goToPage(page, 'run-overview');

        // Run 106 has a fill attached
        const runId = 108;

        const fillNumberCellSelector = `#row${runId}-fillNumber`;
        const fillNumber = await page.$eval(fillNumberCellSelector, (cell) => cell.innerText);

        await page.$eval(`${fillNumberCellSelector} a`, (link) => link.click());
        await waitForNetworkIdleAndRedraw(page);

        const redirectedUrl = await page.url();
        const urlParameters = redirectedUrl.slice(redirectedUrl.indexOf('?') + 1).split('&');

        expect(urlParameters).to.contain('page=lhc-fill-details');
        expect(urlParameters).to.contain(`fillNumber=${fillNumber}`);
    });

    it('should successfully display duration without warning popover when run has both trigger start and stop', async () => {
        await goToPage(page, 'run-overview');
        const runDurationCell = await page.$('#row106-runDuration');
        expect(await runDurationCell.$('.popover-trigger')).to.be.null;
        expect(await runDurationCell.evaluate((element) => element.innerText)).to.equal('25:00:00');
    });

    it('should successfully display UNKNOWN without warning popover when run last for more than 48 hours', async () => {
        const runDurationCell = await page.$('#row105-runDuration');
        expect(await runDurationCell.$('.popover-trigger')).to.be.null;
        expect(await runDurationCell.evaluate((element) => element.innerText)).to.equal('UNKNOWN');
    });

    it('should successfully display popover warning when run is missing trigger start', async () => {
        const popoverContent = await getPopoverContent(await page.$('#row104-runDuration .popover-trigger'));
        expect(popoverContent).to.equal('Duration based on o2 start because of missing trigger start information');
    });

    it('should successfully display popover warning when run is missing trigger stop', async () => {
        const popoverContent = await getPopoverContent(await page.$('#row103-runDuration .popover-trigger'));
        expect(popoverContent).to.equal('Duration based on o2 stop because of missing trigger stop information');
    });

    it('should successfully display popover warning when run is missing trigger start and stop', async () => {
        const popoverContent = await getPopoverContent(await page.$('#row102-runDuration .popover-trigger'));
        expect(popoverContent).to.equal('Duration based on o2 start AND stop because of missing trigger information');
    });
};
