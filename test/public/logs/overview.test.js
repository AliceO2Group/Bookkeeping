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
    goToPage,
    getFirstRow,
    getColumnCellsInnerTexts,
    checkColumnBalloon,
    checkColumnValuesWithRegex,
    waitForFirstRowToHaveId,
    expectUrlParams,
    reloadPage,
    fillInput,
    getInnerText,
    getPopoverSelector,
    waitForTimeout,
    waitForNavigation,
    waitForTableLength,
    waitForEmptyTable,
    waitForTableTotalRowsCountToEqual,
    waitForTableFirstRowIndexToEqual,
} = require('../defaults.js');
const { resetDatabaseContent } = require('../../utilities/resetDatabaseContent.js');

const { expect } = chai;

module.exports = () => {
    let page;
    let browser;
    let url;

    let table;
    let firstRowId;
    let parsedFirstRowId;

    before(async () => {
        [page, browser, url] = await defaultBefore();
        await page.setViewport({
            width: 1400,
            height: 940,
            deviceScaleFactor: 1,
        });
        await resetDatabaseContent();
    });

    after(async () => {
        [page, browser] = await defaultAfter(page, browser);
    });

    it('loads the page successfully', async () => {
        const response = await goToPage(page, 'log-overview');

        expect(response.status()).to.equal(200);

        const title = await page.title();
        expect(title).to.equal('AliceO2 Bookkeeping');
    });

    it('Should display the correct items counter at the bottom of the page', async () => {
        await goToPage(page, 'log-overview');

        await expectInnerText(page, '#firstRowIndex', '1');
        await expectInnerText(page, '#lastRowIndex', '10');
        await expectInnerText(page, '#totalRowsCount', '119');
    });

    it('Should have balloon on title, tags and runs columns', async () => {
        await goToPage(page, 'log-overview');
        await page.waitForSelector('tbody tr:not(.loading-row)');

        await checkColumnBalloon(page, 1, 1);
        await checkColumnBalloon(page, 1, 4);
        await checkColumnBalloon(page, 1, 5);
    });

    it('can filter by log title', async () => {
        await waitForTableLength(page, 10);

        await pressElement(page, '#openFilterToggle');
        await page.waitForSelector('#titleFilterText');

        await fillInput(page, '#titleFilterText', 'first');
        await waitForTableLength(page, 1);

        await fillInput(page, '#titleFilterText', 'bogusbogusbogus');
        await waitForEmptyTable(page);

        await pressElement(page, '#reset-filters');
    });

    it('should successfully provide an input to filter on log content', async () => {
        await waitForTableLength(page, 10);

        await fillInput(page, '#contentFilterText', 'particle');
        await waitForTableLength(page, 2);

        await fillInput(page, '#titleFilterText', 'this-content-do-not-exists-anywhere');
        await waitForEmptyTable(page);

        await pressElement(page, '#reset-filters');
    });

    it('can filter by log author', async () => {
        await waitForTableLength(page, 10);

        await fillInput(page, '#authorFilterText', 'Jane');
        await waitForEmptyTable(page);

        await pressElement(page, '#reset-filters');

        await waitForTableLength(page, 10);

        await fillInput(page, '#authorFilterText', 'John');
        await waitForTableLength(page, 5);

        await pressElement(page, '#reset-filters');
    });

    it('should successfully provide an easy-to-access button to filter in/out anonymous logs', async () => {
        // Close the filter panel
        await pressElement(page, '#openFilterToggle');
        await waitForTableTotalRowsCountToEqual(page, 119);

        const authors = await getColumnCellsInnerTexts(page, 'author');
        expect(authors.some((author) => author === 'Anonymous')).to.be.true;

        await pressElement(page, '#main-action-bar > div:nth-child(1) .switch');
        await waitForTableTotalRowsCountToEqual(page, 117);

        await checkColumnValuesWithRegex(page, 'author', '^Anonymous$', {
            negation: true,
        });

        await pressElement(page, '#main-action-bar > div:nth-child(1) .switch');
        await waitForTableTotalRowsCountToEqual(page, 119);
        await checkColumnValuesWithRegex(page, 'author', '^Anonymous$', {
            valuesCheckingMode: 'some',
        });
    });

    it('can filter by creation date', async () => {
        await pressElement(page, '#openFilterToggle');

        await waitForTableTotalRowsCountToEqual(page, 119);

        // Insert a minimum date into the filter
        const limit = '2020-02-02';
        await fillInput(page, '#createdFilterFrom', limit);
        await fillInput(page, '#createdFilterTo', limit);
        await waitForTableLength(page, 1);

        await pressElement(page, '#reset-filters');
    });

    it('can filter by tags', async () => {
        await waitForTableTotalRowsCountToEqual(page, 119);

        await pressElement(page, '.tags-filter .dropdown-trigger');

        // Select the second available filter and wait for the changes to be processed
        const firstCheckboxId = 'tag-dropdown-option-DPG';
        await pressElement(page, `#${firstCheckboxId}`, true);
        await waitForTableLength(page, 1);

        // Deselect the filter and wait for the changes to process
        await pressElement(page, `#${firstCheckboxId}`, true);
        await waitForTableLength(page, 10);

        // Select the first available filter and the second one at once
        const secondCheckboxId = 'tag-dropdown-option-FOOD';
        await pressElement(page, `#${firstCheckboxId}`, true);
        await pressElement(page, `#${secondCheckboxId}`, true);
        await waitForEmptyTable(page);

        // Set the filter operation to "OR"
        await pressElement(page, '#tag-filter-combination-operator-radio-button-or', true);
        await waitForTableLength(page, 3);

        await pressElement(page, '#reset-filters');
    });

    it('can filter by environments', async () => {
        await waitForTableLength(page, 10);

        await fillInput(page, '.environments-filter input', '8E4aZTjY');
        await waitForTableLength(page, 3);

        await pressElement(page, '#reset-filters');
        await waitForTableLength(page, 10);

        await fillInput(page, '.environments-filter input', 'abcdefgh');
        await waitForEmptyTable(page);

        await pressElement(page, '#reset-filters');
    });

    it('can search for tag in the dropdown', async () => {
        await pressElement(page, '.tags-filter .dropdown-trigger');

        {
            await fillInput(page, '#tag-dropdown-search-input', 'food');
            const popoverTrigger = await page.$('.tags-filter .popover-trigger');
            const popoverSelector = await getPopoverSelector(popoverTrigger);
            await page.waitForSelector(`${popoverSelector} .dropdown-option:nth-child(2)`, { hidden: true });
            const options = await page.$$(`${popoverSelector} .dropdown-option`);
            expect(await options[0].evaluate((option) => option.innerText)).to.equal('FOOD');
        }
        {
            await fillInput(page, '#tag-dropdown-search-input', 'fOoD');
            const popoverTrigger = await page.$('.tags-filter .popover-trigger');
            const popoverSelector = await getPopoverSelector(popoverTrigger);
            await page.waitForSelector(`${popoverSelector} .dropdown-option:nth-child(2)`, { hidden: true });
            const options = await page.$$(`${popoverSelector} .dropdown-option`);
            expect(await options[0].evaluate((option) => option.innerText)).to.equal('FOOD');
        }
    });

    it('can filter by run number', async () => {
        await waitForTableLength(page, 10);

        // Insert some text into the filter
        await fillInput(page, '#runsFilterText', '1, 2');
        await waitForTableLength(page, 2);

        await pressElement(page, '#reset-filters');
        await waitForTableLength(page, 10);

        await fillInput(page, '#runsFilterText', '1234567890');
        await waitForEmptyTable(page);

        await pressElement(page, '#reset-filters');
    });

    it('can filter by lhc fill number', async () => {
        await waitForTableLength(page, 10);

        await fillInput(page, '#lhcFillsFilter', '1, 6');
        await waitForTableLength(page, 1);

        await pressElement(page, '#reset-filters');
        await waitForTableLength(page, 10);

        await fillInput(page, '#lhcFillsFilter', '1234567890');
        await waitForEmptyTable(page);

        await pressElement(page, '#reset-filters');
    });

    it('can sort by columns in ascending and descending manners', async () => {
        await waitForTableLength(page, 10);

        // Close the filter panel
        await pressElement(page, '#openFilterToggle');
        await waitForFirstRowToHaveId(page, 'row119');

        await page.waitForSelector('th#title');
        await page.hover('th#title');
        await page.waitForSelector('#title-sort-preview');

        // Sort by log title in an ascending manner
        await pressElement(page, 'th#title');
        await waitForFirstRowToHaveId(page, 'row6');

        // Hover something else to have title sort displayed
        await page.hover('th#author');
        await page.waitForSelector('#title-sort');

        // Toggle to sort this towards reverse alphabetical order
        await pressElement(page, 'th#title');
        await waitForFirstRowToHaveId(page, 'row3');

        // Toggle to clear this sorting
        await pressElement(page, 'th#title');
        await waitForFirstRowToHaveId(page, 'row119');

        // Sort by log author in ascending then descending manner
        await pressElement(page, 'th#author');
        await waitForFirstRowToHaveId(page, 'row3');

        await pressElement(page, 'th#author');
        await waitForFirstRowToHaveId(page, 'row1');

        await pressElement(page, 'th#author');
        await waitForFirstRowToHaveId(page, 'row119');

        // Sort by creation date in ascending then descending manner
        await pressElement(page, 'th#createdAt');
        await waitForFirstRowToHaveId(page, 'row1');
    });

    it('shows correct datatypes in respective columns', async () => {
        table = await page.$$('tr');
        firstRowId = await getFirstRow(table, page);

        // Expectations of header texts being of a certain datatype
        const headerDatatypes = {
            title: (title) => typeof title === 'string',
            author: (authorName) => typeof authorName === 'string',
            createdAt: (date) => !isNaN(Date.parse(date)),
            tags: (tags) => typeof tags === 'string' && tags === tags.toUpperCase(),
            replies: (replyCount) => typeof replyCount === 'number' || replyCount === '',
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

    it('can switch to infinite mode in amountSelector', async () => {
        const INFINITE_SCROLL_CHUNK = 19;
        await reloadPage(page);

        // Wait fot the table to be loaded, it should have at least 2 rows (not loading) but less than 19 rows (which is infinite scroll chunk)
        await page.waitForSelector('table tbody tr:nth-child(2)');
        expect(await page.$(`table tbody tr:nth-child(${INFINITE_SCROLL_CHUNK})`)).to.be.null;

        const amountSelectorButtonSelector = '#amountSelector button';

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

    it('can set how many logs are available per page', async () => {
        await reloadPage(page);

        const amountSelectorButtonSelector = '#amountSelector button';
        await pressElement(page, amountSelectorButtonSelector);

        await page.waitForSelector('#amountSelector .dropup-menu');
        await pressElement(page, '#amountSelector .dropup-menu .menu-item:first-child');

        await waitForTableLength(page, 5);
    });

    it('can switch between pages of logs', async () => {
        // Expect the page selector to be available with two pages
        await reloadPage(page);
        await page.waitForSelector('#pageSelector .btn-tab');
        const pageSelectorButtons = await page.$$('#pageSelector .btn-tab');
        expect(pageSelectorButtons.length).to.equal(5);

        // Expect the table rows to change upon page navigation
        table = await page.$$('tr');
        const oldFirstRowId = await getFirstRow(table, page);
        await pressElement(page, '#page2');

        await waitForTableFirstRowIndexToEqual(page, 11);
        table = await page.$$('tr');
        const newFirstRowId = await getFirstRow(table, page);
        expect(oldFirstRowId).to.not.equal(newFirstRowId);

        // Expect us to be able to do the same with the page arrows
        await pressElement(page, '#pageMoveLeft');
        await waitForTableFirstRowIndexToEqual(page, 1);
        const oldFirstPageButtonClass = await page.$eval('#page1', (element) => element.className);
        expect(oldFirstPageButtonClass).to.include('selected');

        // The same, but for the other (right) arrow
        await pressElement(page, '#pageMoveRight');
        await waitForTableFirstRowIndexToEqual(page, 11);
        const newFirstPageButtonClass = await page.$eval('#page1', (element) => element.className);
        expect(newFirstPageButtonClass).to.not.include('selected');
    });

    it('dynamically switches between visible pages in the page selector', async () => {
        // Override the amount of logs visible per page manually
        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.logs.overviewModel.pagination.itemsPerPage = 1;
        });
        await waitForTimeout(100);

        // Expect the page five button to now be visible, but no more than that
        const pageFiveButton = await page.$('#page5');
        expect(Boolean(pageFiveButton)).to.be.true;
        const pageSixButton = await page.$('#page6');
        expect(Boolean(pageSixButton)).to.be.false;

        // Expect the page one button to have fallen away when clicking on page five button
        await waitForTimeout(500);
        await page.waitForSelector('#page5');
        await pressElement(page, '#page5');
        await waitForTimeout(500);
        const pageOneButton = await page.$('#page1');
        expect(Boolean(pageOneButton)).to.be.false;

        // Revert changes for next test
        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.logs.overviewModel.pagination.itemsPerPage = 10;
        });
    });

    it('notifies if table loading returned an error', async () => {
        await goToPage(page, 'log-overview');

        await waitForTableLength(page, 10);
        await page.evaluate(() => {
            /*
             * As an example, override the amount of logs visible per page manually
             * We know the limit is 100 as specified by the Dto
             */
            // eslint-disable-next-line no-undef
            model.logs.overviewModel.pagination.itemsPerPage = 200;
        });

        await expectInnerText(page, '.alert-danger', 'Invalid Attribute: "query.page.limit" must be less than or equal to 100');

        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.logs.overviewModel.pagination.itemsPerPage = 10;
        });
    });

    it('can navigate to a log detail page', async () => {
        await goToPage(page, 'log-overview');

        await waitForNavigation(page, () => pressElement(page, 'a.btn-redirect'));
        await expectUrlParams(page, { page: 'log-detail', id: 119 });
    });

    it.skip('does not reset pagination filters when navigating away', async () => {
        await goToPage(page, 'log-overview');

        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.logs.overviewModel.pagination.itemsPerPage = 1;
        });
        await waitForTimeout(100);

        await pressElement(page, '#page2');
        await waitForTimeout(500);
        // Expect the pagination to still be on page two
        let currentPageSelected = await page.evaluate(() => window.model.logs.overviewModel.pagination.currentPage);
        expect(currentPageSelected).to.equal(2);

        // Navigate to a log detail page via href
        const firstRow = await page.$('a.btn-redirect');
        const firstRowId = await firstRow.evaluate((aHref) => aHref.id);
        parsedFirstRowId = parseInt(firstRowId.slice('btn'.length, firstRowId.length), 10);
        await firstRow.evaluate((aHref) => aHref.click());
        await waitForTimeout(500);

        const redirectedUrl = await page.url();
        expect(redirectedUrl).to.equal(`${url}/?page=log-detail&id=${parsedFirstRowId}`);

        await page.goBack();
        await waitForTimeout(400);
        const currentLocation = await page.url();
        expect(currentLocation).to.equal(`${url}/?page=log-overview`);
        // Expect the pagination to still be on page two
        currentPageSelected = await page.evaluate(() => window.model.logs.overviewModel.pagination.currentPage);
        expect(currentPageSelected).to.equal(2);
    });

    it('should successfully display the list of related runs as hyperlinks to their details page', async () => {
        await goToPage(page, 'log-overview');
        await page.evaluate(() => window.model.disableInputDebounce());

        await waitForNavigation(page, () => pressElement(page, '#row119-runs a'));
        expectUrlParams(page, { page: 'run-detail', runNumber: 2 });
    });

    it('should successfully display the list of related LHC fills as hyperlinks to their details page', async () => {
        await goToPage(page, 'log-overview');
        await page.evaluate(() => window.model.disableInputDebounce());

        await waitForNavigation(page, () => pressElement(page, '#row119-lhcFills a'));
        expectUrlParams(page, { page: 'lhc-fill-details', fillNumber: 1 });
    });
};
