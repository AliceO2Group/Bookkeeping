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
    getAllDataFields,
    checkColumnBalloon,
} = require('../defaults');

const { expect } = chai;

module.exports = () => {
    let page;
    let browser;
    let url;

    let originalNumberOfRows;
    let table;
    let firstRowId;
    let parsedFirstRowId;

    before(async () => {
        [page, browser, url] = await defaultBefore(page, browser);
        await page.setViewport({
            width: 1400,
            height: 820,
            deviceScaleFactor: 1,
        });
    });

    after(async () => {
        [page, browser] = await defaultAfter(page, browser);
    });

    it('loads the page successfully', async () => {
        const response = await page.goto(`${url}?page=log-overview`, { waitUntil: 'networkidle0' });

        // We expect the page to return the correct status code, making sure the server is running properly
        expect(response.status()).to.equal(200);

        // We expect the page to return the correct title, making sure there isn't another server running on this port
        const title = await page.title();
        expect(title).to.equal('AliceO2 Bookkeeping');
    });

    it('Should have balloon on title, tags and runs columns', async () => {
        await goToPage(page, 'log-overview');
        await page.waitForTimeout(100);

        await checkColumnBalloon(page, 1, 1);
        await checkColumnBalloon(page, 1, 4);
        await checkColumnBalloon(page, 1, 5);
    });

    it('can filter by log title', async () => {
        // Expect the page to have loaded enough rows to be able to test the filtering
        const originalRows = await page.$$('table tr');
        originalNumberOfRows = originalRows.length - 1;
        await page.waitForTimeout(200);
        expect(originalNumberOfRows).to.be.greaterThan(1);

        // Open the filters
        await pressElement(page, '#openFilterToggle');
        await page.waitForTimeout(200);

        // Insert some text into the filter
        await page.type('#titleFilterText', 'first');
        await page.waitForTimeout(300);

        // Expect the (new) total number of rows to be less than the original number of rows
        const firstFilteredRows = await page.$$('table tr');
        const firstFilteredNumberOfRows = firstFilteredRows.length - 1;
        expect(firstFilteredNumberOfRows).to.be.lessThan(originalNumberOfRows);

        // Insert some other text into the filter
        await page.type('#titleFilterText', ' bogusbogusbogus');
        await page.waitForTimeout(300);

        // Expect the table to be empty
        const secondFilteredRows = await page.$$('table tr');
        const secondFilteredNumberOfRows = secondFilteredRows.length - 1;
        expect(secondFilteredNumberOfRows).to.equal(0);

        // Clear the filters
        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.logs.resetLogsParams();
        });
        await page.waitForTimeout(100);

        // Expect the total number of rows to once more equal the original total
        const unfilteredRows = await page.$$('table tr');
        const unfilteredNumberOfRows = unfilteredRows.length - 1;
        expect(unfilteredNumberOfRows).to.equal(originalNumberOfRows);
    });

    it('can filter by log author', async () => {
        // Expect the page to have loaded enough rows to be able to test the filtering
        const originalRows = await page.$$('table tr');
        originalNumberOfRows = originalRows.length - 1;
        await page.waitForTimeout(200);
        expect(originalNumberOfRows).to.be.greaterThan(1);

        // Insert some text into the filter
        await page.type('#authorFilterText', 'Jane');
        await page.waitForTimeout(500);

        // Expect the (new) total number of rows to be less than the original number of rows
        const firstFilteredRows = await page.$$('table tr');
        const firstFilteredNumberOfRows = firstFilteredRows.length - 1;
        expect(firstFilteredNumberOfRows).to.be.lessThan(originalNumberOfRows);

        // Insert some other text into the filter
        await page.type('#authorFilterText', ' DoesNotExist');
        await page.waitForTimeout(500);

        // Expect the table to be empty
        const secondFilteredRows = await page.$$('table tr');
        const secondFilteredNumberOfRows = secondFilteredRows.length - 1;
        expect(secondFilteredNumberOfRows).to.equal(0);

        // Clear the filters
        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.logs.resetLogsParams();
        });
        await page.waitForNetworkIdle();
        await page.waitForTimeout(100);

        // Expect the total number of rows to once more equal the original total
        const unfilteredRows = await page.$$('table tr');
        const unfilteredNumberOfRows = unfilteredRows.length - 1;
        expect(unfilteredNumberOfRows).to.equal(originalNumberOfRows);
    });

    it('can filter by creation date', async () => {
        // Insert a minimum date into the filter
        await page.waitForTimeout(100);
        // 6 logs are created before this test
        const limitDate = new Date();
        const limit = String(limitDate.getMonth() + 1).padStart(2, '0')
            + String(limitDate.getDate()).padStart(2, '0')
            + limitDate.getFullYear();
        await page.focus('#createdFilterFrom');
        await page.keyboard.type(limit);
        await page.waitForTimeout(300);

        // Expect the (new) total number of rows to be less than the original number of rows
        const firstFilteredRows = await page.$$('table tr');
        const firstFilteredNumberOfRows = firstFilteredRows.length - 1;
        expect(firstFilteredNumberOfRows).to.be.lessThan(originalNumberOfRows);

        // Insert a maximum date into the filter
        await page.focus('#createdFilterTo');
        await page.keyboard.type(limit);
        await page.waitForTimeout(300);

        // 6 logs are created before this test
        const secondFilteredRows = await page.$$('table tr');
        const secondFilteredNumberOfRows = secondFilteredRows.length - 1;
        expect(secondFilteredNumberOfRows).to.equal(7);

        // Insert a maximum date into the filter that is invalid
        await page.focus('#createdFilterTo');
        await page.keyboard.type('01012000');
        await page.waitForTimeout(300);

        // Do not expect anything to change, as this maximum is below the minimum, therefore the API is not called
        const thirdFilteredRows = await page.$$('table tr');
        const thirdFilteredNumberOfRows = thirdFilteredRows.length - 1;
        expect(thirdFilteredNumberOfRows).to.equal(secondFilteredNumberOfRows);

        // Clear the filters
        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.logs.resetLogsParams();
        });
    });

    it('can filter by tags', async () => {
        await page.waitForTimeout(300);

        // Select the second available filter and wait for the changes to be processed
        const firstCheckboxId = 'tagCheckbox2';
        await pressElement(page, `#${firstCheckboxId}`);
        await page.waitForTimeout(300);

        // Expect the (new) total number of rows to be less than the original number of rows
        const firstFilteredRows = await page.$$('table tr');
        const firstFilteredNumberOfRows = firstFilteredRows.length - 1;
        expect(firstFilteredNumberOfRows).to.be.lessThan(originalNumberOfRows);

        // Deselect the filter and wait for the changes to process
        await pressElement(page, `#${firstCheckboxId}`);
        await page.waitForTimeout(300);

        // Expect the total number of rows to equal the original total
        const firstUnfilteredRows = await page.$$('table tr');
        expect(firstUnfilteredRows.length - 1).to.equal(originalNumberOfRows);

        // Select the first available filter and the second one at once
        const secondCheckboxId = 'tagCheckbox1';
        await pressElement(page, `#${firstCheckboxId}`);
        await page.waitForTimeout(300);
        await pressElement(page, `#${secondCheckboxId}`);
        await page.waitForTimeout(300);

        // Expect the table to be empty
        const secondFilteredRows = await page.$$('table tr');
        const secondFilteredNumberOfRows = secondFilteredRows.length - 1;
        expect(secondFilteredNumberOfRows).to.equal(0);

        // Set the filter operation to "OR"
        await pressElement(page, '#tagFilterOperationRadioButtonOR');
        await page.waitForTimeout(300);

        // Expect there now to be more rows than both the previous table and the table with only one filter
        const thirdFilteredRows = await page.$$('table tr');
        const thirdFilteredNumberOfRows = thirdFilteredRows.length - 1;
        expect(thirdFilteredNumberOfRows).to.be.greaterThan(firstFilteredNumberOfRows);
        expect(thirdFilteredNumberOfRows).to.be.greaterThan(secondFilteredNumberOfRows);

        // Clear the filters
        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.logs.resetLogsParams();
        });
    });

    it('can show and hide extra tags if available', async () => {
        const TAGS_LIMIT = 5;
        const buttonId = '#toggleMoreTags';

        await page.waitForTimeout(300);

        // Expect the page to have a button allowing for showing more tags
        const toggleFiltersButton = await page.$(buttonId);
        let buttonText = await page.evaluate((element) => element.innerText, toggleFiltersButton);
        expect(buttonText.trim()).to.equal('More tags');

        // Expect the button to show at least one extra tag when clicked
        await pressElement(page, buttonId);
        await page.waitForTimeout(300);
        let extraTagFilter = await page.$(`#tagCheckbox${TAGS_LIMIT + 1}`);
        expect(Boolean(extraTagFilter)).to.be.true;

        // Expect the text to change to reflect the newly shown tags
        buttonText = await page.evaluate((element) => element.innerText, toggleFiltersButton);
        expect(buttonText.trim()).to.equal('Less tags');

        // Expect the button to remove the extra tag when clicked again
        await pressElement(page, buttonId);
        await page.waitForTimeout(300);
        extraTagFilter = await page.$(`#tagCheckbox${TAGS_LIMIT + 1}`);
        expect(Boolean(extraTagFilter)).to.be.false;
    });

    it('can sort by columns in ascending and descending manners', async () => {
        // Close the filter panel
        await pressElement(page, '#openFilterToggle');
        await page.waitForTimeout(300);

        // Expect a sorting preview to appear when hovering over a column header
        await page.hover('th#title');
        await page.waitForTimeout(100);
        const sortingPreviewIndicator = await page.$('#title-sort-preview');
        expect(Boolean(sortingPreviewIndicator)).to.be.true;

        // Sort by log title in an ascending manner
        const titleHeader = await page.$('th#title');
        await titleHeader.evaluate((button) => button.click());
        await page.waitForTimeout(300);

        // Expect the log titles to be in alphabetical order
        const firstTitles = await getAllDataFields(page, 'title');
        expect(firstTitles).to.deep.equal(firstTitles.sort());
        // Hover something else to have title sort displayed
        await page.hover('th#author');
        await page.waitForTimeout(100);
        const sortingIndicator = await page.$('#title-sort');
        expect(Boolean(sortingIndicator)).to.be.true;

        // Toggle to sort this towards reverse alphabetical order
        await titleHeader.evaluate((button) => button.click());
        await page.waitForTimeout(300);

        // Expect the log titles to be in reverse alphabetical order
        const secondTitles = await getAllDataFields(page, 'title');
        expect(secondTitles).to.deep.equal(secondTitles.sort((a, b) => b.localeCompare(a)));

        // Toggle to clear this sorting
        await titleHeader.evaluate((button) => button.click());
        await page.waitForTimeout(300);

        // Expect the log titles to no longer be sorted in any way
        const thirdTitles = await getAllDataFields(page, 'title');
        expect(thirdTitles).to.not.deep.equal(firstTitles);
        expect(thirdTitles).to.not.deep.equal(secondTitles);

        // Sort by log author in ascending manner
        const authorHeader = await page.$('th#author');
        await authorHeader.evaluate((button) => button.click());
        await page.waitForTimeout(300);

        // Expect the authors to be in alphabetical order
        const firstAuthors = await getAllDataFields(page, 'author');
        expect(firstAuthors).to.deep.equal(firstAuthors.sort());

        // Sort by creation date in ascending manner
        const createdAtHeader = await page.$('th#createdAt');
        await createdAtHeader.evaluate((button) => button.click());
        await page.waitForTimeout(300);

        // Expect the log author column to be unsorted
        const secondAuthors = await getAllDataFields(page, 'author');
        expect(secondAuthors).to.not.deep.equal(firstAuthors);
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
        const amountSelectorButton = await page.$('#amountSelector button');

        // Expect the dropdown options to be visible when it is selected
        await amountSelectorButton.evaluate((button) => button.click());
        await page.waitForTimeout(100);
        const amountSelectorDropdown = await page.$('#amountSelector .dropup-menu');
        expect(Boolean(amountSelectorDropdown)).to.be.true;

        const menuItems = await page.$$('#amountSelector .dropup-menu .menu-item');
        await menuItems[menuItems.length - 1].evaluate((button) => button.click());
        await page.waitForTimeout(100);

        const amountSelectorButtonText = await page.evaluate((element) => element.innerText, amountSelectorButton);
        expect(amountSelectorButtonText.endsWith('Infinite ')).to.be.true;

        await page.evaluate(() => {
            window.scrollBy(0, window.innerHeight);
        });
        await page.waitForTimeout(400);
        const tableRows = await page.$$('table tr');

        expect(tableRows.length > 20).to.be.true;
    });

    it('can set how many logs are available per page', async () => {
        await page.waitForTimeout(500);
        // Expect the amount selector to currently be set to Infinite (after the previous test)
        const amountSelectorId = '#amountSelector';
        await page.waitForTimeout(500);
        const amountSelectorButton = await page.$(`${amountSelectorId} button`);
        const amountSelectorButtonText = await page.evaluate((element) => element.innerText, amountSelectorButton);
        expect(amountSelectorButtonText.endsWith('Infinite ')).to.be.true;

        // Expect the dropdown options to be visible when it is selected
        await amountSelectorButton.evaluate((button) => button.click());
        await page.waitForTimeout(100);
        const amountSelectorDropdown = await page.$(`${amountSelectorId} .dropup-menu`);
        expect(Boolean(amountSelectorDropdown)).to.be.true;

        // Expect the amount of visible logs to reduce when the first option (5) is selected
        const menuItem = await page.$(`${amountSelectorId} .dropup-menu .menu-item`);
        await menuItem.evaluate((button) => button.click());
        await page.waitForTimeout(100);

        const tableRows = await page.$$('table tr');
        expect(tableRows.length - 1).to.equal(5);
    });

    it('can switch between pages of logs', async () => {
        // Expect the page selector to be available with two pages
        await page.waitForTimeout(300);
        const pageSelectorId = '#amountSelector';
        const pageSelector = await page.$(pageSelectorId);
        await page.waitForTimeout(300);
        expect(Boolean(pageSelector)).to.be.true;
        await page.waitForTimeout(300);
        const pageSelectorButtons = await page.$$('#pageSelector .btn-tab');
        expect(pageSelectorButtons.length).to.equal(5);

        // Expect the table rows to change upon page navigation
        const oldFirstRowId = await getFirstRow(table, page);
        const secondPage = await page.$('#page2');
        await secondPage.evaluate((button) => button.click());
        await page.waitForTimeout(100);
        table = await page.$$('tr');
        const newFirstRowId = await getFirstRow(table, page);
        expect(oldFirstRowId).to.not.equal(newFirstRowId);

        // Expect us to be able to do the same with the page arrows
        const prevPage = await page.$('#pageMoveLeft');
        await prevPage.evaluate((button) => button.click());
        await page.waitForTimeout(300);
        const oldFirstPageButton = await page.$('#page1');
        const oldFirstPageButtonClass = await page.evaluate((element) => element.className, oldFirstPageButton);
        expect(oldFirstPageButtonClass).to.include('selected');

        // The same, but for the other (right) arrow
        const nextPage = await page.$('#pageMoveRight');
        await nextPage.evaluate((button) => button.click());
        await page.waitForTimeout(100);
        const newFirstPageButton = await page.$('#page1');
        const newFirstPageButtonClass = await page.evaluate((element) => element.className, newFirstPageButton);
        expect(newFirstPageButtonClass).to.not.include('selected');
    });

    it('dynamically switches between visible pages in the page selector', async () => {
        // Override the amount of logs visible per page manually
        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.logs.setLogsPerPage(1);
        });
        await page.waitForTimeout(100);

        // Expect the page five button to now be visible, but no more than that
        const pageFiveButton = await page.$('#page5');
        expect(Boolean(pageFiveButton)).to.be.true;
        const pageSixButton = await page.$('#page6');
        expect(Boolean(pageSixButton)).to.be.false;

        // Expect the page one button to have fallen away when clicking on page five button
        await page.waitForTimeout(500);
        await page.waitForSelector('#page5');
        await pressElement(page, '#page5');
        await page.waitForTimeout(500);
        const pageOneButton = await page.$('#page1');
        expect(Boolean(pageOneButton)).to.be.false;

        // Revert changes for next test
        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.logs.setLogsPerPage(10);
        });
    });

    it('can navigate to the log creation page', async () => {
        // Click on the button to start creating a new log
        await goToPage(page, 'log-create');

        // Expect the page to be the log creation page at this point
        const redirectedUrl = await page.url();
        expect(redirectedUrl).to.equal(`${url}/?page=log-create`);
    });

    it('notifies if table loading returned an error', async () => {
        // Go back to the home page
        await goToPage(page, 'log-overview');

        /*
         * As an example, override the amount of logs visible per page manually
         * We know the limit is 100 as specified by the Dto
         */
        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.logs.setLogsPerPage(200);
        });
        await page.waitForTimeout(100);

        // We expect there to be a fitting error message
        const expectedMessage = 'Invalid Attribute: "query.page.limit" must be less than or equal to 100';
        await expectInnerText(page, '.alert-danger', expectedMessage);

        // Revert changes for next test
        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.logs.setLogsPerPage(10);
        });
        await page.waitForTimeout(100);
    });

    it('can navigate to a log detail page', async () => {
        // Go back to the home page
        await goToPage(page, 'log-overview');

        const firstButton = await page.$('a.btn-redirect');
        const firstRowId = await firstButton.evaluate((btn) => btn.id);
        parsedFirstRowId = parseInt(firstRowId.slice('btn'.length, firstRowId.length), 10);

        // We expect the entry page to have the same id as the id from the log overview
        await firstButton.evaluate((button) => button.click());
        await page.waitForTimeout(500);

        const redirectedUrl = await page.url();
        expect(redirectedUrl).to.equal(`${url}/?page=log-detail&id=${parsedFirstRowId}`);
    });

    it.skip('does not reset pagination filters when navigating away', async () => {
        // Go back to the home page
        await goToPage(page, 'log-overview');

        // Override the amount of logs visible per page manually
        await page.evaluate(() => {
            // eslint-disable-next-line no-undef
            model.logs.setLogsPerPage(1);
        });
        await page.waitForTimeout(100);

        // Go to the second page of "logs"
        const secondPageButton = await page.$('#page2');
        await secondPageButton.evaluate((button) => button.click());
        await page.waitForTimeout(500);
        // Expect the pagination to still be on page two
        let currentPageSelected = await page.evaluate(() => window.model.logs.getSelectedPage());
        expect(currentPageSelected).to.equal(2);

        // Navigate to a log detail page via href
        const firstRow = await page.$('a.btn-redirect');
        const firstRowId = await firstRow.evaluate((aHref) => aHref.id);
        parsedFirstRowId = parseInt(firstRowId.slice('btn'.length, firstRowId.length), 10);
        await firstRow.evaluate((aHref) => aHref.click());
        await page.waitForTimeout(500);

        const redirectedUrl = await page.url();
        expect(redirectedUrl).to.equal(`${url}/?page=log-detail&id=${parsedFirstRowId}`);

        // Go back to the home page again
        await page.goBack();
        await page.waitForTimeout(400);
        const currentLocation = await page.url();
        expect(currentLocation).to.equal(`${url}/?page=log-overview`);
        // Expect the pagination to still be on page two
        currentPageSelected = await page.evaluate(() => window.model.logs.getSelectedPage());
        expect(currentPageSelected).to.equal(2);
    });
};
