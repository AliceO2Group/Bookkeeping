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

const chai = require('chai');
const {
    defaultBefore,
    defaultAfter,
    expectInnerText,
    pressElement,
    getFirstRow,
    goToPage,
} = require('../defaults');
const { checkColumnBalloon } = require('../defaults.js');
const { RunDefinition } = require('../../../lib/services/getRunDefinition.js');

const { expect } = chai;

module.exports = () => {
    let page;
    let browser;
    let url;

    let table;
    let firstRowId;

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
        [page, browser, url] = await defaultBefore(page, browser);
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
        const response = await page.goto(`${url}?page=run-overview`, { waitUntil: 'networkidle0' });

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
            runQuality: (string) => typeof string == 'string',
            nDetectors: (number) => typeof number == 'number',
            nFlps: (number) => typeof number == 'number',
            nEpns: (number) => typeof number == 'number',
            nSubtimeframes: (number) => typeof number == 'number',
            bytesReadOut: (number) => typeof number == 'number',
            dd_flp: (boolean) => typeof boolean == 'boolean',
            dcs: (boolean) => typeof boolean == 'boolean',
            epn: (boolean) => typeof boolean == 'boolean',
            epnTopology: (string) => typeof string == 'string',
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
        await page.waitForTimeout(100);

        expect(await page.$eval('#firstRowIndex', (element) => parseInt(element.innerText, 10))).to.equal(1);
        expect(await page.$eval('#lastRowIndex', (element) => parseInt(element.innerText, 10))).to.equal(8);
        expect(await page.$eval('#totalRowsCount', (element) => parseInt(element.innerText, 10))).to.equal(110);
    });

    it('successfully switch to raw timestamp display', async () => {
        const rawTimestampToggleSelector = '#preferences-raw-timestamps';
        expect(await page.evaluate(() => document.querySelector('#row104 td:nth-child(6)').innerText)).to.equal('08/08/2019\n11:00:00*');
        expect(await page.evaluate(() => document.querySelector('#row104 td:nth-child(7)').innerText)).to.equal('08/08/2019\n13:00:00');
        await page.$eval(rawTimestampToggleSelector, (element) => element.click());
        expect(await page.evaluate(() => document.querySelector('#row104 td:nth-child(6)').innerText)).to.equal('1565262000000*');
        expect(await page.evaluate(() => document.querySelector('#row104 td:nth-child(7)').innerText)).to.equal('1565269200000');
        // Go back to normal
        await page.$eval(rawTimestampToggleSelector, (element) => element.click());
    });

    it('can switch to infinite mode in amountSelector', async () => {
        const amountSelectorButton = await page.$('#amountSelector button');

        // Expect the dropdown options to be visible when it is selected
        await amountSelectorButton.evaluate((button) => button.click());
        await page.waitForTimeout(100);
        const amountSelectorDropdown = await page.$('#amountSelector .dropup-menu');
        expect(Boolean(amountSelectorDropdown)).to.be.true;

        const menuItems = await page.$$('#amountSelector .dropup-menu .menu-item');
        await menuItems[menuItems.length - 1].evaluate((button) => button.click());
        await page.waitForTimeout(300);

        await page.evaluate(() => {
            window.scrollBy(0, window.innerHeight);
        });
        await page.waitForTimeout(400);
        const tableRows = await page.$$('table tr');
        expect(tableRows.length).to.be.greaterThan(20);
    });

    it('can set how many runs are available per page', async () => {
        await page.waitForTimeout(300);
        // Expect the amount selector to currently be set to Infinite (after the previous test)
        const amountSelectorId = '#amountSelector';
        const amountSelectorButton = await page.$(`${amountSelectorId} button`);
        const amountSelectorButtonText = await page.evaluate((element) => element.innerText, amountSelectorButton);
        await page.waitForTimeout(300);
        expect(amountSelectorButtonText.endsWith('Infinite ')).to.be.true;

        // Expect the dropdown options to be visible when it is selected
        await amountSelectorButton.evaluate((button) => button.click());
        await page.waitForTimeout(100);
        const amountSelectorDropdown = await page.$(`${amountSelectorId} .dropup-menu`);
        expect(Boolean(amountSelectorDropdown)).to.be.true;

        // Expect the amount of visible runs to reduce when the first option (5) is selected
        const menuItem = await page.$(`${amountSelectorId} .dropup-menu .menu-item`);
        await menuItem.evaluate((button) => button.click());
        await page.waitForTimeout(100);

        const tableRows = await page.$$('table tr');
        expect(tableRows.length - 1).to.equal(5);

        // Expect the custom per page input to have red border and text color if wrong value typed
        const customPerPageInput = await page.$(`${amountSelectorId} input[type=number]`);
        await customPerPageInput.evaluate((input) => input.focus());
        await page.$eval(`${amountSelectorId} input[type=number]`, (el) => {
            el.value = '1111';
            el.dispatchEvent(new Event('input'));
        });
        await page.waitForTimeout(100);
        expect(Boolean(await page.$(`${amountSelectorId} input:invalid`))).to.be.true;
    });

    /*
     * Todo: implement without waitForTimeout (tip: use screenshot function to see where it's going wrong).
     * it('can switch between pages of runs', async () => {
     *     await page.waitForTimeout(300);
     *     // Expect the page selector to be available with two pages
     *     const pageSelectorId = '#amountSelector';
     *     const pageSelector = await page.$(pageSelectorId);
     *     await page.waitForTimeout(300);
     *     expect(Boolean(pageSelector)).to.be.true;
     *     await page.waitForTimeout(300);
     *     const pageSelectorButtons = await page.$$('#pageSelector .btn-tab');
     *     expect(pageSelectorButtons.length).to.equal(5);
     */

    /*
     *     Const oldFirstRowId = await getFirstRow(table, page);
     *     // Works correctly if this line is uncommented
     *     // takeScreenshot(page);
     *     pressElement(page, '#page2');
     *     await page.waitForFunction('document.querySelector("#page2").classList.contains("selected")');
     *     table = await page.$$('tr');
     *     const newFirstRowId = await getFirstRow(table, page);
     *     expect(oldFirstRowId).to.not.equal(newFirstRowId);
     */

    /*
     *     // Expect us to be able to do the same with the page arrows
     *     const prevPage = await page.$('#pageMoveLeft');
     *     await prevPage.evaluate((button) => button.click());
     *     await page.waitForTimeout(100);
     *     const oldFirstPageButton = await page.$('#page1');
     *     const oldFirstPageButtonClass = await page.evaluate((element) => element.className, oldFirstPageButton);
     *     expect(oldFirstPageButtonClass).to.include('selected');
     */

    /*
     *     // The same, but for the other (right) arrow
     *     const nextPage = await page.$('#pageMoveRight');
     *     await nextPage.evaluate((button) => button.click());
     *     await page.waitForTimeout(100);
     *     const newFirstPageButton = await page.$('#page1');
     *     const newFirstPageButtonClass = await page.evaluate((element) => element.className, newFirstPageButton);
     *     expect(newFirstPageButtonClass).to.not.include('selected');
     * }).timeout(15000);
     */

    it('dynamically switches between visible pages in the page selector', async () => {
        // Override the amount of runs visible per page manually
        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.runs.pagination.itemsPerPage = 1;
        });
        await page.waitForTimeout(100);

        // Expect the page five button to now be visible, but no more than that
        const pageFiveButton = await page.$('#page5');
        expect(Boolean(pageFiveButton)).to.be.true;
        const pageSixButton = await page.$('#page6');
        expect(Boolean(pageSixButton)).to.be.false;

        // Expect the page one button to have fallen away when clicking on page five button
        await pressElement(page, '#page5');
        await page.waitForTimeout(100);
        const pageOneButton = await page.$('#page1');
        expect(Boolean(pageOneButton)).to.be.false;
    });

    it('notifies if table loading returned an error', async () => {
        /*
         * As an example, override the amount of runs visible per page manually
         * We know the limit is 100 as specified by the Dto
         */
        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.runs.pagination.itemsPerPage = 200;
        });
        await page.waitForTimeout(100);

        // We expect there to be a fitting error message
        const expectedMessage = 'Invalid Attribute: "query.page.limit" must be less than or equal to 100';
        await expectInnerText(page, '.alert-danger', expectedMessage);

        // Revert changes for next test
        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.runs.pagination.itemsPerPage = 10;
        });
        await page.waitForTimeout(100);
    });

    it('can navigate to a run detail page', async () => {
        await goToPage(page, 'run-overview');
        await page.waitForTimeout(100);
        await page.waitForSelector('tbody tr');
        const firstRow = await page.$('tbody tr');
        const expectedRunId = await firstRow.evaluate((element) => element.id)
            .then((id) => parseInt(id.slice('row'.length), 10));

        await page.evaluate(() => document.querySelector('tbody tr:first-of-type a').click());
        await page.waitForTimeout(100);
        const redirectedUrl = await page.url();

        const urlParameters = redirectedUrl.slice(redirectedUrl.indexOf('?') + 1).split('&');

        expect(urlParameters).to.contain('page=run-detail');
        expect(urlParameters).to.contain(`id=${expectedRunId}`);
    });

    it('Should have balloon on detector, tags and topology column', async () => {
        await goToPage(page, 'run-overview');
        await page.waitForTimeout(100);

        await pressElement(page, '#openFilterToggle');
        await page.waitForTimeout(200);

        // Run 106 have data long enough to overflow
        await page.type('#runNumber', '106');
        await page.waitForTimeout(500);

        await checkColumnBalloon(page, 1, 2);
        await checkColumnBalloon(page, 1, 3);
        await checkColumnBalloon(page, 1, 18);
    });

    it('Should display balloon if the text overflows', async () => {
        await goToPage(page, 'run-overview');
        await page.waitForTimeout(100);
        const cell = await page.$('tbody tr td:nth-of-type(2)');
        // We need the actual content to overflow in order to display balloon
        await cell.evaluate((element) => {
            element.querySelector('.popover-actual-content').innerText = 'a really long text'.repeat(50);
        });
        // Scroll to refresh the balloon triggers
        await page.mouse.wheel({ deltaY: 100 });

        const popoverAnchor = await cell.$('.popover-anchor');
        expect(popoverAnchor).to.not.be.null;

        /**
         * Returns the computed display attribute of the popover anchor
         * @returns {*} the computed display
         */
        const getPopoverDisplay = () => popoverAnchor.evaluate((element) => window.getComputedStyle(element).display);

        expect(await getPopoverDisplay()).to.be.equal('none');
        await cell.hover();
        expect(await getPopoverDisplay()).to.be.equal('flex');
    });

    it('should successfully filter on detectors', async () => {
        await page.goto(`${url}?page=run-overview`, { waitUntil: 'networkidle0' });

        // Open filter toggle
        await pressElement(page, '#openFilterToggle');
        await page.waitForTimeout(200);

        await page.$eval('.detector-filter-dropdown-container', (element) => element.click());
        await page.$eval('#detector-filter-dropdown-option-ITS', (element) => element.click());
        await page.$eval('#detector-filter-dropdown-option-FT0', (element) => element.click());
        await page.waitForTimeout(300);

        table = await page.$$('tbody tr');
        expect(table.length).to.equal(2);

        await page.$eval('#detector-filter-combination-operator-radio-button-or', (element) => element.click());
        await page.waitForTimeout(300);

        table = await page.$$('tbody tr');
        expect(table.length).to.equal(6);

        await page.$eval('#detector-filter-combination-operator-radio-button-none', (element) => element.click());
        await page.waitForTimeout(300);

        table = await page.$$('tbody tr');
        expect(table.length).to.equal(3);
    });

    it('should successfully filter on definition', async () => {
        await page.goto(`${url}?page=run-overview`, { waitUntil: 'networkidle0' });
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
                    return document.querySelector(`#${rowId}-definition-text`).innerText;
                })).to.be.oneOf(authorizedRunDefinition);
            }
        };

        // Open filter toggle
        await pressElement(page, '#openFilterToggle');
        await page.waitForTimeout(200);

        await page.$eval(physicsFilterSelector, (element) => element.click());
        await page.waitForTimeout(300);
        table = await page.$$('tbody tr');
        expect(table.length).to.equal(4);
        await checkTableRunDefinitions(table, [RunDefinition.Physics]);

        await page.$eval(syntheticFilterSelector, (element) => element.click());
        await page.waitForTimeout(300);
        table = await page.$$('tbody tr');
        expect(table.length).to.equal(6);
        await checkTableRunDefinitions(table, [RunDefinition.Physics, RunDefinition.Synthetic]);

        await page.$eval(physicsFilterSelector, (element) => element.click());
        await page.waitForTimeout(300);
        table = await page.$$('tbody tr');
        expect(table.length).to.equal(2);
        await checkTableRunDefinitions(table, [RunDefinition.Synthetic]);

        await page.$eval(cosmicsFilterSelector, (element) => element.click());
        await page.waitForTimeout(300);
        table = await page.$$('tbody tr');
        expect(table.length).to.equal(3);
        await checkTableRunDefinitions(table, [RunDefinition.Synthetic, RunDefinition.Cosmics]);

        await page.$eval(syntheticFilterSelector, (element) => element.click());
        await page.waitForTimeout(300);
        table = await page.$$('tbody tr');
        expect(table.length).to.equal(1);
        await checkTableRunDefinitions(table, [RunDefinition.Cosmics]);

        await page.$eval(technicalFilterSelector, (element) => element.click());
        await page.waitForTimeout(300);
        table = await page.$$('tbody tr');
        expect(table.length).to.equal(2);
        await checkTableRunDefinitions(table, [RunDefinition.Cosmics, RunDefinition.Technical]);

        await page.$eval(cosmicsFilterSelector, (element) => element.click());
        await page.waitForTimeout(300);
        table = await page.$$('tbody tr');
        expect(table.length).to.equal(1);
        await checkTableRunDefinitions(table, [RunDefinition.Technical]);

        await page.$eval(calibrationFilterSelector, (element) => element.click());
        await page.waitForTimeout(300);
        table = await page.$$('tbody tr');
        expect(table.length).to.equal(2);
        await checkTableRunDefinitions(table, [RunDefinition.Technical, RunDefinition.Calibration]);

        await page.$eval(commissioningFilterSelector, (element) => element.click());
        await page.waitForTimeout(300);
        table = await page.$$('tbody tr');
        await checkTableRunDefinitions(table, [RunDefinition.Commissioning]);
        await page.$eval(commissioningFilterSelector, (element) => element.click());
        await page.waitForTimeout(300);

        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.runs.pagination.itemsPerPage = 20;
        });
        await page.$eval(physicsFilterSelector, (element) => element.click());
        await page.$eval(syntheticFilterSelector, (element) => element.click());
        await page.$eval(cosmicsFilterSelector, (element) => element.click());
        await page.waitForTimeout(300);
        table = await page.$$('tbody tr');
        expect(table.length).to.equal(9);
        await checkTableRunDefinitions(
            table,
            [RunDefinition.Cosmics, RunDefinition.Technical, RunDefinition.Physics, RunDefinition.Synthetic, RunDefinition.Calibration],
        );
    });

    it('should update to current date when empty and time is set', async () => {
        await page.goto(`${url}?page=run-overview`, { waitUntil: 'networkidle0' });
        page.waitForTimeout(100);
        // Open the filters
        await pressElement(page, '#openFilterToggle');
        await page.waitForTimeout(200);
        let today = new Date();
        today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
        [today] = today.toISOString().split('T');
        const time = '00:01';

        for (const selector of Object.values(timeFilterSelectors)) {
            await page.type(selector, time);
            await page.waitForTimeout(300);
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
        await page.goto(`${url}?page=run-overview`, { waitUntil: 'networkidle0' });
        page.waitForTimeout(100);
        const dateString = '03-21-2021';
        const validValue = '2021-03-21';
        // Open the filters
        await pressElement(page, '#openFilterToggle');
        await page.waitForTimeout(200);
        // Set date
        for (const key in dateFilterSelectors) {
            await page.focus(dateFilterSelectors[key]);
            await page.keyboard.type(dateString);
            await page.waitForTimeout(500);
            await page.focus(timeFilterSelectors[key]);
            await page.keyboard.type('00-01-AM');
            await page.waitForTimeout(500);
            const value = await page.$eval(dateFilterSelectors[key], (element) => element.value);
            expect(value).to.equal(validValue);
        }
    });
    it('The max/min should be the right value when date is set to same day', async () => {
        await page.goto(`${url}?page=run-overview`, { waitUntil: 'networkidle0' });
        page.waitForTimeout(100);
        const dateString = '03-02-2021';
        // Open the filters
        await pressElement(page, '#openFilterToggle');
        await page.waitForTimeout(200);
        // Set date to an open day
        for (const selector of Object.values(dateFilterSelectors)) {
            await page.type(selector, dateString);
            await page.waitForTimeout(300);
        }
        await page.type(timeFilterSelectors.startFrom, '11:11');
        await page.type(timeFilterSelectors.startTo, '14:00');
        await page.type(timeFilterSelectors.endFrom, '11:11');
        await page.type(timeFilterSelectors.endTo, '14:00');
        await page.waitForTimeout(500);

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
        await page.goto(`${url}?page=run-overview`, { waitUntil: 'networkidle0' });
        page.waitForTimeout(100);
        const dateString = '03-20-2021';
        const maxTime = '23:59';
        const minTime = '00:00';
        // Open the filters
        await pressElement(page, '#openFilterToggle');
        await page.waitForTimeout(200);
        // Set date to an open day
        for (const selector of Object.values(dateFilterSelectors)) {
            await page.type(selector, dateString);
            await page.waitForTimeout(500);
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
        await page.goto(`${url}?page=run-overview`, { waitUntil: 'networkidle0' });
        page.waitForTimeout(100);

        await pressElement(page, '#openFilterToggle');
        await page.waitForTimeout(200);

        const runDurationOperatorSelector = '#duration-operator';
        const runDurationOperator = await page.$(runDurationOperatorSelector) || null;
        expect(runDurationOperator).to.not.be.null;
        expect(await runDurationOperator.evaluate((element) => element.value)).to.equal('=');

        const runDurationLimitSelector = '#duration-limit';
        const runDurationLimit = await page.$(runDurationLimitSelector) || null;
        expect(runDurationLimit).to.not.be.null;

        await page.focus(runDurationLimitSelector);
        await page.keyboard.type('1500');
        await page.waitForTimeout(300);

        await page.select(runDurationOperatorSelector, '=');
        await page.waitForTimeout(300);

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
        await page.waitForTimeout(300);

        await page.select(runDurationOperatorSelector, '>=');
        await page.waitForTimeout(300);

        // Expect only unknown
        runDurationList = await page.evaluate(() => Array.from(document.querySelectorAll('tbody tr')).map((row) => {
            const rowId = row.id;
            return document.querySelector(`#${rowId}-runDuration-text`)?.innerText;
        }));

        expect(runDurationList.every((runDuration) => runDuration === 'UNKNOWN')).to.be.true;
    });

    it('Should successfully filter runs by their run quality', async () => {
        await page.goto(`${url}?page=run-overview`, { waitUntil: 'networkidle0' });
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
        await page.waitForTimeout(200);

        await page.$eval(badFilterSelector, (element) => element.click());
        await page.waitForTimeout(300);
        table = await page.$$('tbody tr');
        expect(table.length).to.equal(1);
        await checkTableRunQualities(table, ['bad']);

        await page.$eval(testFilterSelector, (element) => element.click());
        await page.waitForTimeout(300);
        table = await page.$$('tbody tr');
        await checkTableRunQualities(table, ['bad', 'test']);

        await page.$eval(testFilterSelector, (element) => element.click());
        await page.waitForTimeout(300);
        table = await page.$$('tbody tr');
        expect(table.length).to.equal(1);
        await checkTableRunQualities(table, ['bad']);
    });

    it('Should successfully filter runs by their trigger value', async () => {
        await page.goto(`${url}?page=run-overview`, { waitUntil: 'networkidle0' });
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
        await page.waitForTimeout(200);

        await page.$eval(offFilterSelector, (element) => element.click());
        await page.waitForTimeout(300);
        table = await page.$$('tbody tr');

        expect(table.length).to.equal(8);
        await checkTableRunQualities(table, ['OFF']);

        await page.$eval(ltuFilterSelector, (element) => element.click());
        await page.waitForTimeout(300);
        table = await page.$$('tbody tr');
        await checkTableRunQualities(table, ['OFF', 'LTU']);

        await page.$eval(ltuFilterSelector, (element) => element.click());
        await page.waitForTimeout(300);
        table = await page.$$('tbody tr');

        expect(table.length).to.equal(8);

        await checkTableRunQualities(table, ['OFF']);
    });

    it('should successfully filter on a list of run ids and inform the user about it', async () => {
        await page.reload();
        await page.waitForTimeout(200);
        await page.$eval('#openFilterToggle', (element) => element.click());
        const filterInputSelector = '#runNumber';
        expect(await page.$eval(filterInputSelector, (input) => input.placeholder)).to.equal('e.g. 534454, 534455...');
        await page.focus(filterInputSelector);
        await page.keyboard.type('1, 2');
        await page.waitForTimeout(300);
        table = await page.$$('tbody tr');
        expect(table.length).to.equal(2);
        expect(await page.$$eval('tbody tr', (rows) => rows.map((row) => row.id))).to.eql(['row2', 'row1']);
    });

    it('should successfully filter on a list of fill numbers and inform the user about it', async () => {
        await page.reload();
        await page.waitForTimeout(200);
        await page.$eval('#openFilterToggle', (element) => element.click());
        const filterInputSelector = '#fillNumbers';
        expect(await page.$eval(filterInputSelector, (input) => input.placeholder)).to.equal('e.g. 7966, 7954, 7948...');
        await page.focus(filterInputSelector);
        await page.keyboard.type('1, 3');
        await page.waitForTimeout(400);
        table = await page.$$('tbody tr');
        expect(table.length).to.equal(5);
    });

    it('should successfully filter on a list of environment ids and inform the user about it', async () => {
        await page.reload();
        await page.waitForTimeout(200);
        await page.$eval('#openFilterToggle', (element) => element.click());
        const filterInputSelector = '#environmentIds';
        expect(await page.$eval(filterInputSelector, (input) => input.placeholder)).to.equal('e.g. Dxi029djX, TDI59So3d...');
        await page.focus(filterInputSelector);
        await page.keyboard.type('ABCDEFGHIJ, 0987654321');
        await page.waitForTimeout(300);
        table = await page.$$('tbody tr');
        expect(table.length).to.equal(7);
    });

    it('should successfully filter on nDetectors', async () => {
        await page.goto(`${url}?page=run-overview`, { waitUntil: 'networkidle0' });
        page.waitForTimeout(100);

        await pressElement(page, '#openFilterToggle');
        await page.waitForTimeout(200);

        const nDetectorOperatorSelector = '#nDetectors-operator';
        const nDetectorOperator = await page.$(nDetectorOperatorSelector) || null;
        expect(nDetectorOperator).to.not.be.null;
        expect(await nDetectorOperator.evaluate((element) => element.value)).to.equal('=');

        const nDetectorLimitSelector = '#nDetectors-limit';
        const nDetectorLimit = await page.$(nDetectorLimitSelector) || null;
        expect(nDetectorLimit).to.not.be.null;

        await nDetectorLimit.focus();
        await page.keyboard.type('3');
        await page.waitForTimeout(300);
        await page.select(nDetectorOperatorSelector, '<=');
        await page.waitForTimeout(300);

        const nDetectorsList = await page.evaluate(() => Array.from(document.querySelectorAll('tbody tr')).map((row) => {
            const rowId = row.id;
            return document.querySelector(`#${rowId}-detectors .nDetectors-badge`)?.innerText;
        }));

        /*
         * The nDetectors can be null if the detectors' field is null but the nDetectors is not, which can be added in
         * tests data
         */
        expect(nDetectorsList.every((nDetectors) => parseInt(nDetectors, 10) <= 3 || nDetectors === null)).to.be.true;
    });

    it('should successfully filter on nFLPs', async () => {
        await page.goto(`${url}?page=run-overview`, { waitUntil: 'networkidle0' });
        page.waitForTimeout(100);

        await pressElement(page, '#openFilterToggle');
        await page.waitForTimeout(200);

        const nFlpsOperatorSelector = '#nFlps-operator';
        const nFlpsOperator = await page.$(nFlpsOperatorSelector) || null;
        expect(nFlpsOperator).to.not.be.null;
        expect(await nFlpsOperator.evaluate((element) => element.value)).to.equal('=');

        const nFlpsLimitSelector = '#nFlps-limit';
        const nFlpsLimit = await page.$(nFlpsLimitSelector) || null;
        expect(nFlpsLimit).to.not.be.null;

        await nFlpsLimit.focus();
        await page.keyboard.type('10');
        await page.waitForTimeout(300);
        await page.select(nFlpsOperatorSelector, '<=');
        await page.waitForTimeout(300);

        const nFlpsList = await page.evaluate(() => Array.from(document.querySelectorAll('tbody tr')).map((row) => {
            const rowId = row.id;
            return document.querySelector(`#${rowId}-nFlps-text`)?.innerText;
        }));
        expect(nFlpsList.every((nFlps) => parseInt(nFlps, 10) <= 10)).to.be.true;
    });

    it('should successfully filter on nEPNs', async () => {
        await page.goto(`${url}?page=run-overview`, { waitUntil: 'networkidle0' });
        page.waitForTimeout(100);

        await pressElement(page, '#openFilterToggle');
        await page.waitForTimeout(200);

        const nEpnsOperatorSelector = '#nEpns-operator';
        const nEpnsOperator = await page.$(nEpnsOperatorSelector) || null;
        expect(nEpnsOperator).to.not.be.null;
        expect(await nEpnsOperator.evaluate((element) => element.value)).to.equal('=');

        const nEpnsLimitSelector = '#nEpns-limit';
        const nEpnsLimit = await page.$(nEpnsLimitSelector) || null;
        expect(nEpnsLimit).to.not.be.null;

        await nEpnsLimit.focus();
        await page.keyboard.type('10');
        await page.waitForTimeout(300);
        await page.select(nEpnsOperatorSelector, '<=');
        await page.waitForTimeout(300);

        const nEpnsList = await page.evaluate(() => Array.from(document.querySelectorAll('tbody tr')).map((row) => {
            const rowId = row.id;
            return document.querySelector(`#${rowId}-nEpns-text`)?.innerText;
        }));
        expect(nEpnsList.every((nEpns) => parseInt(nEpns, 10) <= 10)).to.be.true;
    });

    const EXPORT_RUNS_TRIGGER_SELECTOR = '#export-runs-trigger';
    it('should successfully display runs export button', async () => {
        const runsExportButton = await page.$(EXPORT_RUNS_TRIGGER_SELECTOR);
        expect(runsExportButton).to.be.not.null;
    });

    it('should successfully display runs export modal on click on export button', async () => {
        let exportModal = await page.$('#export-runs-modal');
        expect(exportModal).to.be.null;

        await page.$eval(EXPORT_RUNS_TRIGGER_SELECTOR, (button) => button.click());
        await page.waitForTimeout(100);
        exportModal = await page.$('#export-runs-modal');

        expect(exportModal).to.not.be.null;
    });

    it('should successfully display information when export will be truncated', async () => {
        await page.reload();
        await page.waitForTimeout(200);

        await page.$eval(EXPORT_RUNS_TRIGGER_SELECTOR, (button) => button.click());
        await page.waitForTimeout(100);

        const truncatedExportWarning = await page.$('#export-runs-modal #truncated-export-warning');
        expect(truncatedExportWarning).to.not.be.null;
        expect(await truncatedExportWarning.evaluate((warning) => warning.innerText)).to
            .equal('The runs export is limited to 100 entries, only the last runs will be exported (sorted by run number)');
    });

    it('should successfully display disabled runs export button when there is no runs available', async () => {
        await page.reload();
        await page.waitForTimeout(200);

        await pressElement(page, '#openFilterToggle');
        await page.waitForTimeout(200);

        // Type a fake run number to have no runs
        await page.focus('#runNumber');
        await page.keyboard.type('99999999999');
        await page.waitForTimeout(300);

        expect(await page.$eval(EXPORT_RUNS_TRIGGER_SELECTOR, (button) => button.disabled)).to.be.true;
    });

    it('should successfully navigate to the LHC fill details page', async () => {
        await page.reload();
        await page.waitForTimeout(100);

        // Run 106 has a fill attached
        const runId = 106;

        const fillNumberCellSelector = `#row${runId}-fillNumber`;
        const fillNumber = await page.$eval(fillNumberCellSelector, (cell) => cell.innerText);

        await page.$eval(`${fillNumberCellSelector} a`, (link) => link.click());
        await page.waitForNetworkIdle();
        await page.waitForTimeout(100);

        const redirectedUrl = await page.url();
        const urlParameters = redirectedUrl.slice(redirectedUrl.indexOf('?') + 1).split('&');

        expect(urlParameters).to.contain('page=lhc-fill-details');
        expect(urlParameters).to.contain(`fillNumber=${fillNumber}`);
    });
};
