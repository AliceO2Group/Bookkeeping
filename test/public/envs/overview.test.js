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
    pressElement,
    checkColumnBalloon,
    expectLink,
    validateTableData,
    expectInnerText,
    expectUrlParams,
    waitForNavigation,
    getInnerText,
    waitForTableLength,
    getPopoverSelector,
    goToPage,
    openFilteringPanel,
    fillInput,
    getPeriodInputsSelectors,
    expectAttributeValue,
    resetFilters,
} = require('../defaults.js');
const dateAndTime = require('date-and-time');
const { resetDatabaseContent } = require('../../utilities/resetDatabaseContent.js');

const { expect } = chai;

module.exports = () => {
    let page;
    let browser;

    before(async () => {
        [page, browser] = await defaultBefore(page, browser);
        await page.setViewport({
            width: 700,
            height: 720,
            deviceScaleFactor: 1,
        });

        await resetDatabaseContent();
    });

    after(async () => {
        [page, browser] = await defaultAfter(page, browser);
    });

    it('loads the page successfully', async () => {
        await goToPage(page, 'env-overview');

        // We expect the page to return the correct title, making sure there isn't another server running on this port
        const title = await page.title();
        expect(title).to.equal('AliceO2 Bookkeeping');
    });

    it('shows correct datatypes in respective columns', async () => {
        const { StatusAcronym, STATUS_ACRONYMS } = await import('../../../lib/public/domain/enums/statusAcronym.mjs');

        const statusNames = new Set(Object.keys(StatusAcronym));

        // eslint-disable-next-line jsdoc/require-param
        const checkDate = (date) => !isNaN(dateAndTime.parse(date, 'DD/MM/YYYY hh:mm:ss'));
        const tableDataValidators = {
            id: (id) => /[A-Za-z0-9]+/.test(id),
            runs: (runs) => runs === '-' || runs.split(',').every((run) => !isNaN(run)),
            updatedAt: checkDate,
            status: (currentStatus) => statusNames.has(currentStatus),
            historyItems: (history) => history.split('-').every((statusAcronym) => STATUS_ACRONYMS.includes(statusAcronym)),
        };
        await validateTableData(page, new Map(Object.entries(tableDataValidators)));
    });

    it('Should display the correct items counter at the bottom of the page', async () => {
        await expectInnerText(page, '#firstRowIndex', '1');
        await expectInnerText(page, '#lastRowIndex', '9');
        await expectInnerText(page, '#totalRowsCount', '9');
    });

    it('Should have balloon on runs column', async () => {
        await checkColumnBalloon(page, 1, 2);
        await checkColumnBalloon(page, 1, 6);
    });

    it('Should have correct status color in the overview page', async () => {
        /**
         * Check that a given cell of the given column displays the correct color depending on the status
         *
         * @param {number} rowIndex the index of the row to look for status color
         * @param {number} columnIndex the index of the column to look for status color
         * @returns {Promise<Chai.Assertion>} void promise
         */
        const checkEnvironmentStatusColor = async (rowIndex, columnIndex) => {
            const cellSelector = `tbody tr:nth-of-type(${rowIndex}) td:nth-of-type(${columnIndex})`;
            const cell = await page.waitForSelector(cellSelector);
            const cellContent = await getInnerText(cell);

            switch (cellContent) {
                case 'RUNNING':
                    await page.waitForSelector(`${cellSelector}.success`);
                    break;
                case 'ERROR':
                    await page.waitForSelector(`${cellSelector}.danger`);
                    break;
                case 'CONFIGURED':
                    await page.waitForSelector(`${cellSelector}.primary`);
                    break;
                case 'DONE':
                    await page.waitForSelector(`${cellSelector}.black`);
                    break;
                case 'DESTROYED':
                    await page.waitForSelector(`${cellSelector}.black`);
                    break;
                case 'DEPLOYED':
                    await page.waitForSelector(`${cellSelector}.gray`);
                    break;
                case 'PENDING':
                    await page.waitForSelector(`${cellSelector}.gray`);
                    break;
                case 'STANDBY':
                    await page.waitForSelector(`${cellSelector}.gray`);
                    break;
                case 'UNKNOWN':
                    await page.waitForSelector(`${cellSelector}.gray-dark`);
                    break;
            }

        };

        await checkEnvironmentStatusColor(1, 4);
        await checkEnvironmentStatusColor(2, 4);
        await checkEnvironmentStatusColor(3, 4);
        await checkEnvironmentStatusColor(6, 4);
        await checkEnvironmentStatusColor(9, 4);
    });

    it('can set how many environments are available per page', async () => {
        // Expect the amount selector to currently be set to 9 (because of the defined page height)
        const amountSelectorId = '#amountSelector';
        const amountSelectorButton = await page.waitForSelector(`${amountSelectorId} button`);
        const amountSelectorButtonText = await page.evaluate((element) => element.innerText, amountSelectorButton);
        expect(amountSelectorButtonText.trim().endsWith('9')).to.be.true;

        // Expect the dropdown options to be visible when it is selected
        await pressElement(page, `${amountSelectorId} button`);
        await page.waitForSelector(`${amountSelectorId} .dropup-menu`);

        // Expect the amount of visible environments to reduce when the first option (5) is selected
        await pressElement(page, `${amountSelectorId} .dropup-menu .menu-item`);
        await waitForTableLength(page, 5);

        // Expect the custom per page input to have red border and text color if wrong value typed
        const customPerPageInput = await page.$(`${amountSelectorId} input[type=number]`);
        await customPerPageInput.evaluate((input) => input.focus());
        await page.$eval(`${amountSelectorId} input[type=number]`, (el) => {
            el.value = '1111';
            el.dispatchEvent(new Event('input'));
        });
        await page.waitForSelector(`${amountSelectorId} input:invalid`);
    });

    it('dynamically switches between visible pages in the page selector', async () => {
        // Override the amount of runs visible per page manually
        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.envs.overviewModel.pagination.itemsPerPage = 1;
        });
        await waitForTableLength(page, 1);

        // Expect the page five button to now be visible, but no more than that
        await page.waitForSelector('#page5');
        await page.waitForSelector('#page6', { hidden: true });

        // Expect the page one button to have fallen away when clicking on page five button
        await pressElement(page, '#page5');
        await page.waitForSelector('#page1', { hidden: true });

        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.envs.overviewModel.pagination.reset();
            // eslint-disable-next-line no-undef
            model.envs.overviewModel.pagination.notify();
        });
    });

    it('should successfully display the list of related runs as hyperlinks to their details page', async () => {
        await waitForNavigation(page, () => pressElement(page, 'a#env-overview', true));
        await waitForNavigation(page, () => pressElement(page, '#rowTDI59So3d-runs a', true));
        expectUrlParams(page, { page: 'run-detail', runNumber: 103 });
    });

    it('should successfully display dropdown links', async () => {
        await waitForNavigation(page, () => pressElement(page, 'a#env-overview'));

        // Running env
        let envId = 'CmCvjNbg';
        await pressElement(page, `tr[id='row${envId}'] .popover-trigger`, true);
        let popover = await getPopoverSelector(await page.waitForSelector(`tr[id='row${envId}'] .popover-trigger`));

        await expectLink(page, `${popover} :nth-child(1 of .external-link)`, {
            href: 'http://localhost:8081/?q={%22partition%22:{%22match%22:%22CmCvjNbg%22},%22severity%22:{%22in%22:%22W%20E%20F%22}}',
            innerText: 'Infologger FLP',
        });

        await expectLink(page, `${popover} :nth-child(2 of .external-link)`, {
            href: 'http://localhost:8080/?page=environment&id=CmCvjNbg',
            innerText: 'ECS',
        });

        await expectLink(page, `${popover} #add-log-link`, {
            href: 'http://localhost:4000/?page=log-create&environmentIds=CmCvjNbg',
            innerText: 'Add log',
        });

        // Not running env
        envId = 'EIDO13i3D';
        await pressElement(page, `tr[id='row${envId}'] .popover-trigger`);
        popover = await getPopoverSelector(await page.waitForSelector(`tr[id='row${envId}'] .popover-trigger`));

        await expectLink(page, `${popover} :nth-child(1 of .external-link)`, {
            href: 'http://localhost:8081/?q={%22partition%22:{%22match%22:%22EIDO13i3D%22},%22severity%22:{%22in%22:%22W%20E%20F%22}}',
            innerText: 'Infologger FLP',
        });

        // ECS link should not be present
        await page.waitForSelector(`${popover} :nth-child(2 of .external-link)`, { hidden: true });

        await expectLink(page, `${popover} #add-log-link`, {
            href: 'http://localhost:4000/?page=log-create&environmentIds=EIDO13i3D&runNumbers=94,95,96',
            innerText: 'Add log',
        });
    });

    it('should skip load when infinite scroll is enabled but call it when disabled', async () => {
        // Set up spy on the overviewModel.load method
        await page.evaluate(() => {
            const originalLoad = model.envs.overviewModel.load.bind(model.envs.overviewModel);
            model.envs.overviewModel.load = function(...args) {
                model.envs.overviewModel._loadCallCount++;
                return originalLoad(...args);
            };
        });

        await page.evaluate(() => {
            model.envs.overviewModel._loadCallCount = 0;
            model.envs.loadOverview();
        });

        // load() should have been called once
        let loadCallCount = await page.evaluate(() => {
            return model.envs.overviewModel._loadCallCount;
        });
        expect(loadCallCount).to.equal(1);

        // Enable infinite scroll mode
        await page.evaluate(() => {
            model.envs.overviewModel.pagination.enableInfiniteMode();
        });

        // Reset counter and test again
        await page.evaluate(() => {
            model.envs.overviewModel._loadCallCount = 0;
            model.envs.loadOverview();
        });

        // load() should not have been called
        loadCallCount = await page.evaluate(() => {
            return model.envs.overviewModel._loadCallCount;
        });
        expect(loadCallCount).to.equal(0);
    });

    it('should successfully open the filtering panel', async () => {
        // Get the popover key from the filter button's parent
        const filterButton = await page.waitForSelector('#openFilterToggle');
        const popoverKey = await filterButton.evaluate((button) => {
            return button.parentElement.getAttribute('data-popover-key');
        });
        const filterPanelSelector = `.popover[data-popover-key="${popoverKey}"]`;
        
        // Initially the filtering panel should be closed
        await page.waitForSelector(filterPanelSelector, { hidden: true });
        
        // Open the filtering panel
        await openFilteringPanel(page);
        await page.waitForSelector(filterPanelSelector, { visible: true });
    });

    it('should successfully filter environments by their related run numbers', async () => {
        /**
         * This is the sequence to test filtering the environments based on their related run numbers.
         *
         * @param {string} selector the filter input selector
         * @param {string} inputValue the value to type in the filter input
         * @param {string[]} expectedIds the list of expected environment IDs after filtering
         * @return {void}
         */
        const filterOnRunNumbers = async (selector, inputValue, expectedIds) => {
            await fillInput(page, selector, inputValue, ['change']);
            await waitForTableLength(page, expectedIds.length);
            expect(await page.$$eval('tbody tr', (rows) => rows.map((row) => row.id))).to.eql(expectedIds.map(id => `row${id}`));
        }

        await expectAttributeValue(page, '.runs-filter input', 'placeholder', 'e.g. 553203, 553221, ...');

        await filterOnRunNumbers('.runs-filter input', '10', ['TDI59So3d', 'Dxi029djX']);
        await resetFilters(page);

        await filterOnRunNumbers('.runs-filter input', '103', ['TDI59So3d']);
        await resetFilters(page);
        
        await filterOnRunNumbers('.runs-filter input', '86, 91', ['KGIS12DS', 'VODdsO12d']);
        await resetFilters(page);
    });
  
    it('should successfully filter environments by their status history', async () => {
        /**
         * This is the sequence to test filtering the environments on their status history.
         *
         * @param {string} selector the filter input selector
         * @param {string} inputValue the value to type in the filter input
         * @param {string[]} expectedIds the list of expected environment IDs after filtering
         * @return {void}
         */
        const filterOnStatusHistory = async (selector, inputValue, expectedIds) => {
            await fillInput(page, selector, inputValue, ['change']);
            await waitForTableLength(page, expectedIds.length);
            expect(await page.$$eval('tbody tr', (rows) => rows.map((row) => row.id))).to.eql(expectedIds.map(id => `row${id}`));
        };
      
        await expectAttributeValue(page, '.historyItems-filter input', 'placeholder', 'e.g. D-R-X');

        await filterOnStatusHistory('.historyItems-filter input', 'C-R-D-X', ['TDI59So3d']);
        await resetFilters(page);

        await filterOnStatusHistory('.historyItems-filter input', 'S-E', ['EIDO13i3D', '8E4aZTjY']);
        await resetFilters(page);

        await filterOnStatusHistory('.historyItems-filter input', 'D-E', ['KGIS12DS']);
        await resetFilters(page);
    });

    it('should successfully filter environments by their current status', async () => {
        /**
         * Checks that all the rows of the given table have a valid current status
         *
         * @param {string[]} authorizedCurrentStatuses  the list of valid current statuses
         * @return {void}
         */
        const checkTableCurrentStatuses = async (authorizedCurrentStatuses) => {
            const rows = await page.$$('tbody tr');
            for (const row of rows) {
                expect(await row.evaluate((rowItem) => {
                    const rowId = rowItem.id;
                    return document.querySelector(`#${rowId}-status-text`).innerText;
                })).to.be.oneOf(authorizedCurrentStatuses);
            }
        };

        const currentStatusSelectorPrefix = '.status-filter #checkboxes-checkbox-';
        const getCurrentStatusCheckboxSelector = (statusName) => `${currentStatusSelectorPrefix}${statusName}`;
        
        await page.$eval(getCurrentStatusCheckboxSelector("RUNNING"), (element) => element.click());
        await waitForTableLength(page, 2);
        await checkTableCurrentStatuses(["RUNNING"]);

        await page.$eval(getCurrentStatusCheckboxSelector("DEPLOYED"), (element) => element.click());
        await waitForTableLength(page, 3);
        await checkTableCurrentStatuses(["RUNNING", "DEPLOYED"]);
    });

    it('should successfully filter environments by their IDs', async () => {
        /**
         * This is the sequence to test filtering the environments on IDs.
         *
         * @param {string} selector the filter input selector
         * @param {string} inputValue the value to type in the filter input
         * @param {string[]} expectedIds the list of expected environment IDs after filtering
         * @return {void}
         */
        const filterOnID = async (selector, inputValue, expectedIds) => {
            await fillInput(page, selector, inputValue, ['change']);
            await waitForTableLength(page, expectedIds.length);
            expect(await page.$$eval('tbody tr', (rows) => rows.map((row) => row.id))).to.eql(expectedIds.map(id => `row${id}`));
        };

        await expectAttributeValue(page, '.id-filter input', 'placeholder', 'e.g. CmCvjNbg, TDI59So3d...');

        await filterOnID('.id-filter input', 'CmCvjNbg', ['CmCvjNbg']);
        await resetFilters(page);

        await filterOnID('.id-filter input', 'CmCvjNbg, TDI59So3d', ['CmCvjNbg', 'TDI59So3d']);
        await resetFilters(page);

        await filterOnID('.id-filter input', 'j', ['CmCvjNbg', 'GIDO1jdkD', '8E4aZTjY', 'Dxi029djX']);
        await resetFilters(page);
    });

    it('should successfully filter environments by their createdAt date', async () => {
         /**
         * This is the sequence to test filtering the environments based on their createdAt date
         *
         * @param {string} selector the filter input selector
         * @param {string} fromDate the from date string
         * @param {string} fromTime the from time string
         * @param {string} toDate the to date string
         * @param {string} toTime the to time string
         * @param {string[]} expectedIds the list of expected environment IDs after filtering
         * @return {void}
         */
        const filterOnCreatedAt = async (selector, fromDate, fromTime, toDate, toTime, expectedIds) => {
            await fillInput(page, selector.fromTimeSelector, fromTime, ['change']);
            await fillInput(page, selector.toTimeSelector, toTime, ['change']);

            await fillInput(page, selector.fromDateSelector, fromDate, ['change']);
            await fillInput(page, selector.toDateSelector, toDate, ['change']);

            await waitForTableLength(page, expectedIds.length, 5000);
            expect(await page.$$eval('tbody tr', (rows) => rows.map((row) => row.id))).to.eql(expectedIds.map(id => `row${id}`));
        };

        await openFilteringPanel(page);

        const createdAtPopoverSelector = await getPopoverSelector(await page.$('.createdAt-filter .popover-trigger'));
        const periodInputsSelectors = getPeriodInputsSelectors(createdAtPopoverSelector);

        await filterOnCreatedAt(
            periodInputsSelectors,
            '2019-05-08',
            '00:00',
            '2019-05-10',
            '00:00',
            ['eZF99lH6'],
        );
        await resetFilters(page);
        await waitForTableLength(page, 9, 10000);

        await filterOnCreatedAt(
            periodInputsSelectors,
            '2019-08-09',
            '00:00',
            '2019-08-09',
            '14:00',
            ['GIDO1jdkD', '8E4aZTjY', 'Dxi029djX'],
        );
        await resetFilters(page);
        await waitForTableLength(page, 9, 10000);
    });
};
