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
const puppeteer = require('puppeteer');
const pti = require('puppeteer-to-istanbul');
const { server } = require('../../lib/application');
const { buildUrl } = require('../../lib/utilities/buildUrl.js');
const dateAndTime = require('date-and-time');
const path = require('path');

const { expect } = chai;

const testToken = server.http.o2TokenService.generateToken(
    0,
    'anonymous',
    'Anonymous',
    'admin',
);

/**
 * Overrides the given URL to add authentication information to it
 *
 * @param {string} url the URL to authenticate
 * @return {string} the authenticated URL
 */
const authenticateUrl = (url) => {
    const authenticatedUrl = new URL(url);
    authenticatedUrl.searchParams.set('personid', 0);
    authenticatedUrl.searchParams.set('username', 'anonymous');
    authenticatedUrl.searchParams.set('name', 'Anonymous');
    authenticatedUrl.searchParams.set('access', 'admin');
    authenticatedUrl.searchParams.set('token', testToken);
    return authenticatedUrl.toString();
};

/**
 * Returns the URL with correct port postfixed.
 * @returns {string} URL specific to the port specified by user/host.
 */
const getUrl = () => `http://localhost:${server.address().port}`;

/**
 * Constructor to build elements before tests start.
 *
 * @returns {Promise<Array>} Array of multiple objects, consisting of Page, Browser and Url.
 */
module.exports.defaultBefore = async () => {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    page.setDefaultTimeout(1500);
    page.setDefaultNavigationTimeout(5000);

    await Promise.all([
        page.coverage.startJSCoverage({ resetOnNavigation: false }),
        page.coverage.startCSSCoverage(),
    ]);

    return [page, browser, getUrl()];
};

/**
 * Destructor to clean up after tests are finished.
 * @param {Object} page Puppeteer page object
 * @param {Object} browser Browser object to run tests on
 * @returns {Promise<Array>} Array of multiple objects, consisting of Page and Browser.
 */
module.exports.defaultAfter = async (page, browser) => {
    const [jsCoverage, cssCoverage] = await Promise.all([
        page.coverage.stopJSCoverage(),
        page.coverage.stopCSSCoverage(),
    ]);

    pti.write([...jsCoverage, ...cssCoverage].filter(({ url = '' } = {}) => url.match(/\.(js|css)$/)), {
        includeHostname: false,
        storagePath: './.nyc_output/lib/public',
    });
    await browser.close();

    return [page, browser];
};

/**
 * Trigger a download and wait for it to be finished
 *
 * @param {puppeteer.Page} page puppeteer page
 * @param {function} trigger function to trigger the expected download
 * @return {Promise} resolves with de download path
 */
exports.waitForDownload = async (page, trigger) => {
    const downloadPath = path.resolve('./download');

    // Check accessibility on frontend
    const session = await page.createCDPSession();
    await session.send('Browser.setDownloadBehavior', {
        behavior: 'allow',
        downloadPath,
        eventsEnabled: true,
    });

    await Promise.all([
        new Promise((resolve, reject) => {
            session.on('Browser.downloadProgress', (event) => {
                if (event.state === 'completed') {
                    resolve('download completed');
                } else if (event.state === 'canceled') {
                    reject(new Error('download canceled'));
                }
            });
            setTimeout(() => reject(new Error('Download timeout after 5000 ms')), 5000);
        }),
        trigger(),
    ]);

    return downloadPath;
};

/**
 * Resolves after a given timeout (temporary replacement for puppeteer Page.waitForTimeout)
 *
 * @deprecated use an appropriate waitForSelector instead
 *
 * @param {number} timeout the timeout to wait (in ms)
 * @return {Promise<void>} resolves once the timeout has been elapsed
 */
const waitForTimeout = (timeout) => new Promise((res) => setTimeout(res, timeout));

/**
 * @deprecated
 */
module.exports.waitForTimeout = waitForTimeout;

/**
 * Waits for the number of table rows to meet the expected size.
 *
 * @param {puppeteer.Page} page - The puppeteer page where the table is located.
 * @param {number} expectedSize - The expected number of table rows, excluding rows marked as loading or empty.
 * @return {Promise<void>} Resolves once the expected number of rows is met, or the timeout is reached.
 */
const waitForTableToLength = async (page, expectedSize) => {
    await page.waitForFunction(
        (expectedSize) => document.querySelectorAll('table tbody tr:not(.loading-row):not(.empty-row)').length === expectedSize,
        {},
        expectedSize,
    );
};

module.exports.waitForTableLength = waitForTableToLength;

/**
 * Waits for table to be loaded
 *
 * @param {puppeteer.Page} page - The puppeteer page where the table is located.
 * @return {Promise<void>} resolves once the table is loaded
 */
const waitForTableToBeLoaded = async (page) => page.waitForSelector('table tbody tr:not(.loading-row):not(.empty-row)');

module.exports.waitForTableToBeLoaded = waitForTableToBeLoaded;

/**
 * Wait for the total number of elements to be the expected one
 *
 * @param {puppeteer.Page} page The puppeteer page where the table is located
 * @param {number} amount the expected amount of items
 * @return {Promise<void>} resolves once the expected amount is present
 */
module.exports.waitForTableTotalRowsCountToEqual = async (page, amount) => {
    await page.waitForFunction(
        (amount) => document.querySelector('#totalRowsCount').innerText === `${amount}`,
        {},
        amount,
    );
};

/**
 * Wait for the first index of table items to be the expected one
 *
 * @param {puppeteer.Page} page the puppeteer page where the table is located
 * @param {number} index the expected index of the first item
 * @return {Promise<void>} resolves once the first item has the specified index
 */
module.exports.waitForTableFirstRowIndexToEqual = async (page, index) => {
    await page.waitForFunction(
        (index) => document.querySelector('#firstRowIndex').innerText === `${index}`,
        {},
        index,
    );
};

/**
 * Waits for the table on the page to be empty.
 *
 * @param {puppeteer.Page} page - The puppeteer page where the table is located.
 * @param {number} [timeout=500] - Optional timeout in milliseconds before the function times out.
 * @return {Promise<void>} Resolves once the table is empty, or the timeout is reached.
 */
const waitForEmptyTable = async (page, timeout = 500) => {
    await page.waitForSelector('table tbody tr.empty-row', { timeout: timeout });
};

module.exports.waitForEmptyTable = waitForEmptyTable;

/**
 * Wait for the first row of the page to have a given id
 *
 * @param {puppeteer.Page} page Puppeteer current page
 * @param {string} id the expected id
 * @return {Promise<puppeteer.ElementHandle>} resolves with the first row element handle once it has the right id
 */
module.exports.waitForFirstRowToHaveId = async (page, id) => page.waitForSelector(`tbody tr:first-child#${id}`);

/**
 * Execute the given navigation function and wait for navigation
 *
 * @param {puppeteer.Page} page the puppeteer page
 * @param {function} navigateFunction function to call to initiate navigation
 * @return {Promise<*>} resolves once the navigation finished
 */
const waitForNavigation = (page, navigateFunction) => Promise.all([
    page.waitForNavigation(),
    navigateFunction(),
]);

exports.waitForNavigation = waitForNavigation;

/**
 * Waits till selector is visible and then clicks element.
 * @param {Object} page Puppeteer page object.
 * @param {string} selector Css selector.
 * @param {boolean} [jsClick=false] if true, use js native click on the element instead of page's click method (useful if element is not visible)
 * @returns {Promise} Whether the element was clickable or not.
 */
module.exports.pressElement = async (page, selector, jsClick = false) => {
    const elementHandler = await page.waitForSelector(selector);

    if (jsClick) {
        await elementHandler.evaluate((element) => element.click());
    } else {
        await elementHandler.click(selector);
    }
};

/**
 * Reload the current page and wait for it to be loaded
 * @param {Page} puppeteerPage Puppeteer page object.
 * @return {Promise} resolves when the page has loaded
 * @deprecated avoid using this function, reloading the full page is very slow
 */
module.exports.reloadPage = (puppeteerPage) => goTo(puppeteerPage, puppeteerPage.url());

/**
 * Navigates to a specific URL and waits until everything is loaded.
 *
 * @param {puppeteer.Page} page puppeteer page object
 * @param {string} url the URL to navigate to
 * @param {object} [options] navigation options
 * @param {boolean} [options.authenticate] if true, the navigation request will be authenticated with a token and test user information
 * @param {number} [options.redrawDuration] the estimated time to wait for the page to redraw
 * @returns {Promise} resolves with the navigation response
 */
const goTo = async (page, url, options) => {
    const { authenticate = true } = options ?? {};

    if (authenticate) {
        url = authenticateUrl(url);
    }

    const response = await page.goto(url, { waitUntil: 'load' });
    // Wait for navbar title to be there, which mean that a first render has been done
    await page.waitForSelector('#navbar-title', { timeout: 5000 });
    return response;
};

/**
 * Goes to a specific page and waits until everything is loaded.
 * @param {Page} puppeteerPage Puppeteer page object.
 * @param {string} pageKey Value of pageKey in: URL/?page={pageKey}&...
 * @param {object} [options] navigation options
 * @param {boolean} [options.authenticate] if true, the navigation request will be authenticated with a token and test user information
 * @param {object} [options.queryParameters] query parameters to add to the page's URL
 * @returns {Promise} Switches the user to the correct page.
 */
module.exports.goToPage = (puppeteerPage, pageKey, options) => {
    const { queryParameters = {} } = options || {};
    const url = buildUrl(getUrl(), {
        page: pageKey,
        ...queryParameters,
    });
    return goTo(puppeteerPage, url);
};

/**
 * Debug helper function
 * This function takes a screenshot of the current screen the page is at, and saves it to
 * database/storage/screenshot.png
 * @param {puppeteer.Page} page Puppeteer page object.
 * @param {string} name Name of the screenshot taken. Useful when taking multiple in a row.
 * @returns {*} None
 */
module.exports.takeScreenshot = async (page, name = 'screenshot') => {
    await page.screenshot({
        path: `/var/storage/${name}.png`,
        type: 'png',
        fullPage: true,
    });
};

/**
 * Special method built due to Puppeteer limitations: looks for the first row matching an ID in a table
 * @param {Object} table An HTML element representing the entire run table
 * @param {Object} page An object representing the browser page being used by Puppeteer
 * @return {Promise<String>} The ID of the first matching row with data
 */
module.exports.getFirstRow = async (table, page) => {
    for await (const child of table) {
        const id = await page.evaluate((element) => element.id, child);
        if (id.startsWith('row')) {
            return id;
        }
    }
};

/**
 * Return the inner text of all the cells of a given column of the first table found in the page
 *
 * @param {puppeteer.Page} page the puppeteer page
 * @param {string} key the key of the column from which data must be retrieved
 * @return {Promise<string[]>} resolves with the list of all cells inner texts
 */
const getColumnCellsInnerTexts = async (page, key) => page.$$eval(
    `table tbody .column-${key}`,
    (cells) => cells.map((cell) => cell.innerText),
);

module.exports.getColumnCellsInnerTexts = getColumnCellsInnerTexts;

/**
 * Return the content of a table as an array (rows) of array (cells)
 *
 * @param {puppeteer.Page} page the puppeteer page
 * @return {Promise<array<string[]>>} resolves with the table content
 */
module.exports.getTableContent = async (page) => {
    await page.waitForSelector('table');
    return JSON.parse(await page.evaluate(() => {
        const rowsContent = [];
        for (const row of document.querySelectorAll('table tbody tr')) {
            const cellsContent = [];
            rowsContent.push(cellsContent);
            for (const cell of row.querySelectorAll('td')) {
                cellsContent.push(cell.innerText);
            }
        }
        return JSON.stringify(rowsContent);
    }));
};

/**
 * Special method built to gather all currently visible data from given columns into array of objects
 * @param {puppeteer.Page} page An object representing the browser page being used by Puppeteer
 * @param {string[]} columnKeys The keys for the columns to gather entities of
 * @return {Promise<Object<string, string>>} An array containing all table partial entities of a columns, in the order displayed by the browser
 */
module.exports.getTableDataSlice = async (page, columnKeys) => {
    const result = [];
    for (const row of await page.$$('table tbody tr')) {
        const entity = {};
        for (const columnKey of columnKeys) {
            entity[columnKey] = await row.$eval(`td.column-${columnKey}`, ({ innerText }) => innerText);
        }
        result.push(entity);
    }
    return result;
};

/**
 * Evaluate and return the text content of a given element handler
 * @param {{evaluate}} elementHandler the puppeteer handler of the element to inspect
 * @returns {Promise<string>} the html content
 */
const getInnerText = async (elementHandler) => await elementHandler.evaluate((element) => element.innerText);

module.exports.getInnerText = getInnerText;

/**
 * Expect an element to have a given text
 *
 * @param {Object} page Puppeteer page object.
 * @param {string} selector Css selector.
 * @param {string} innerText Text to search for.
 * @return {Promise<void>} resolves once the text has been checked
 */
module.exports.expectInnerText = async (page, selector, innerText) => {
    const element = await page.waitForSelector(selector);
    try {
        await page.waitForFunction(
            (selector, innerText) => document.querySelector(selector).innerText === innerText,
            {},
            selector,
            innerText,
        );
    } catch (_) {
        throw new Error(`Expected innerText for ${selector} to be "${innerText}", got "${await getInnerText(element)}"`);
    }
};

/**
 * Expect an element to have a text valid against given validator
 * @param {Object} page Puppeteer page object.
 * @param {string} selector Css selector.
 * @param {function<string, boolean>} validator text validator. It must return true if text is valid, return false or throw otherwise
 * @return {Promise<void>} resolves once the text has been checked
 */
module.exports.expectInnerTextTo = async (page, selector, validator) => {
    const element = await page.waitForSelector(selector);
    const actualInnerText = await getInnerText(element);
    expect(validator(actualInnerText), `"${actualInnerText}" is invalid with respect of given validator`).to.be.true;
};

/**
 * Expect an element to have a text valid against given validator
 * @param {Object} page Puppeteer page object.
 * @param {string} selector Css selector.
 * @param {function<string, boolean>} validator text validator. It must return true if text is valid, return false or throw otherwise
 * @return {Promise<void>} resolves once the text has been checked
 */
module.exports.expectInnerTextTo = async (page, selector, validator) => {
    const element = await page.waitForSelector(selector);
    const actualInnerText = await getInnerText(element);
    expect(validator(actualInnerText), `"${actualInnerText}" is invalid with respect of given validator`).to.be.true;
};

/**
 * Evaluate and return the html content of a given element handler
 * @param {{evaluate}} elementHandler the puppeteer handler of the element to inspect
 * @returns {Promise<XPathResult>} the html content
 */
const getInnerHtml = async (elementHandler) => await elementHandler.evaluate((element) => element.innerHTML);

module.exports.getInnerHtml = getInnerHtml;

/**
 * Return the selector of a popover that correspond to a popover trigger
 *
 * @param {object} popoverTrigger the puppeteer element of the popover trigger
 * @return {Promise<string|null>} the popover selector
 */
exports.getPopoverSelector = (popoverTrigger) => {
    if (popoverTrigger === null) {
        return null;
    }

    return popoverTrigger.evaluate((element) => {
        const key = element.dataset.popoverKey;
        if (!key) {
            return null;
        }

        return `.popover[data-popover-key="${key}"]`;
    });
};

/**
 * Extract the HTML content of a popover corresponding to a popover trigger
 *
 * @param {object} popoverTrigger the puppeteer element of the popover trigger
 * @return {Promise<string>} the HTML content of the trigger
 */
const getPopoverContent = (popoverTrigger) => {
    if (popoverTrigger === null) {
        return null;
    }

    return popoverTrigger.evaluate((element) => {
        const key = element.dataset.popoverKey;
        if (!key) {
            return null;
        }

        const popover = document.querySelector(`.popover[data-popover-key="${key}"]`);
        return popover.innerHTML;
    });
};

module.exports.getPopoverContent = getPopoverContent;

/**
 * Extract the inner text of a popover corresponding to a popover trigger
 *
 * @param {object} popoverTrigger the puppeteer element of the popover trigger
 * @return {Promise<string>} the content of the trigger
 */
const getPopoverInnerText = (popoverTrigger) => {
    if (popoverTrigger === null) {
        return null;
    }

    return popoverTrigger.evaluate((element) => {
        const key = element.dataset.popoverKey;
        if (!key) {
            return null;
        }

        const popover = document.querySelector(`.popover[data-popover-key="${key}"]`);
        return popover.innerText;
    });
};

module.exports.getPopoverInnerText = getPopoverInnerText;

/**
 * Check that the fist cell of the given column contains a popover displayed if the text overflows (named balloon) and that the popover's
 * content is correct
 *
 * @param {puppeteer.Page} page the puppeteer page
 * @param {number} rowIndex the index of the row to look for balloon presence
 * @param {number} columnIndex the index of the column to look for balloon presence
 * @returns {Promise<void>} resolve once balloon is validated
 */
module.exports.checkColumnBalloon = async (page, rowIndex, columnIndex) => {
    const popoverTrigger = await page.waitForSelector(`tbody tr:nth-of-type(${rowIndex}) td:nth-of-type(${columnIndex}) .popover-trigger`);
    const triggerContent = await popoverTrigger.evaluate((element) => element.querySelector('.w-wrapped').innerHTML);

    const actualContent = await getPopoverContent(popoverTrigger);

    expect(triggerContent).to.be.equal(actualContent);
};

/**
 * Fill the input at the given selector and triggers the given events on it
 *
 * @param {puppeteer.Page} page the puppeteer's page object
 * @param {string} inputSelector the selector of the input to fill
 * @param {string} value the value to type in the input
 * @param {string[]} [events=['input']] the list of events to trigger on the input after typing
 * @return {Promise} resolves once the value has been typed
 */
module.exports.fillInput = async (page, inputSelector, value, events = ['input']) => {
    await page.waitForSelector(inputSelector);
    await page.evaluate((inputSelector, value, events) => {
        const element = document.querySelector(inputSelector);
        element.value = value;
        for (const eventKey of events) {
            element.dispatchEvent(new Event(eventKey, { bubbles: true }));
        }
    }, inputSelector, value, events);
};

/**
 * Evaluate and return the value content of a given element handler
 * @param {puppeteer.Page} page the puppeteer page
 * @param {string} selector the input selector
 * @returns {Promise<XPathResult>} the html content
 */
const getInputValue = async (page, selector) => {
    const inputElementHandler = await page.waitForSelector(selector, { timeout: 200 });
    return inputElementHandler.evaluate((input) => input.value);
};

module.exports.getInputValue = getInputValue;

/**
 * Expect an element to have a given value
 *
 * @param {puppeteer.Page} page Puppeteer page object.
 * @param {string} selector the input selector
 * @param {string} value expect input value
 * @return {Promise<void>} resolves once the value has been checked
 */
module.exports.expectInputValue = async (page, selector, value) => {
    expect(await getInputValue(page, selector)).to.equal(value);
};

/**
 * Expect the current page's URL to have exactly the given parameters (unordered)
 *
 * For now only handle scalar parameters
 *
 * @param {puppeteer.Page} page the puppeteer page
 * @param {Object} expectedUrlParameters the expected parameters as an object of key values
 * @return {void}
 */
module.exports.expectUrlParams = (page, expectedUrlParameters) => {
    const [, parametersExpr] = page.url().split('?');
    const urlParameters = parametersExpr.split('&');
    const mismatchingUrlParams = {};

    for (const urlParameter of urlParameters) {
        const [key, value] = urlParameter.split('=');
        // Convert expected to string, if it is a number for example
        if (`${expectedUrlParameters[key]}` !== value) {
            mismatchingUrlParams[key] = {
                expected: expectedUrlParameters[key],
                actual: value,
            };
        }
    }

    expect(mismatchingUrlParams).to.eql({});
};

/**
 * Method to check cells of columns with given id have expected innerText
 *
 * @param {puppeteer.Page} page the puppeteer page
 * @param {string} columnId column id
 * @param {string[]} [expectedInnerTextValues] values expected in columns
 *
 * @return {Promise<void>} resolve once column values were checked
 */
module.exports.expectColumnValues = async (page, columnId, expectedInnerTextValues) => {
    try {
        await page.waitForFunction(
            (columnId, expectedInnerTextValues) => {
                const cells = document.querySelectorAll(`table tbody .column-${columnId}`);
                if (cells.length !== expectedInnerTextValues.length) {
                    return false;
                }

                for (const rowIndex in expectedInnerTextValues) {
                    if (cells[rowIndex].innerText !== expectedInnerTextValues[rowIndex]) {
                        return false;
                    }
                }

                return true;
            },
            {},
            columnId,
            expectedInnerTextValues,
        );
    } catch (_) {
        // Use expect to have explicit error message
        expect(await getColumnCellsInnerTexts(page, columnId)).to.deep.equal(expectedInnerTextValues);
    }
};

/**
 * Method to check cells of a row with given id have expected innerText
 *
 * @param {puppeteer.Page} page the puppeteer page
 * @param {string} rowId row id
 * @param {Object<string, string>} [expectedInnerTextValues] values expected in the row
 *
 * @return {Promise<void>} resolve once row's values were checked
 */
module.exports.expectRowValues = async (page, rowId, expectedInnerTextValues) => {
    try {
        await page.waitForFunction(async (rowId, expectedInnerTextValues) => {
            for (const columnId in expectedInnerTextValues) {
                const actualValue = (await document.querySelectorAll(`table tbody td:nth-of-type(${rowId}) .column-${columnId}`)).innerText;
                if (expectedInnerTextValues[columnId] == actualValue) {
                    return false;
                }
            }
            return true;
        }, rowId, expectedInnerTextValues);
    } catch {
        const rowInnerTexts = {};
        for (const columnId in expectedInnerTextValues) {
            rowInnerTexts[columnId] = (await document.querySelectorAll(`table tbody td:nth-of-type(${rowId}) .column-${columnId}`)).innerText;
        }
        expect(rowInnerTexts).to.eql(expectedInnerTextValues);
    }
};

/**
 * Generic method to validate inner text of cells belonging column with given id.
 * It checks exact match with given values
 *
 * @param {puppeteer.Page} page the puppeteer page
 * @param {string} columnId column id
 * @param {string} expectedValuesRegex string that regex constructor `RegExp(expectedValuesRegex)` returns desired regular expression
 * @param {object} options options
 * @param {'every'|'some'} [options.valuesCheckingMode = 'every'] whether all values are expected to match regex or at least one
 * @param {boolean} [options.negation] if true it's expected not to match given regex
 *
 * @return {Promise<void>} resolved once column values were checked
 */
module.exports.checkColumnValuesWithRegex = async (page, columnId, expectedValuesRegex, options = {}) => {
    const {
        valuesCheckingMode = 'every',
        negation = false,
    } = options;
    await page.waitForFunction((columnId, regexString, valuesCheckingMode, negation) => {
        // Browser context, be careful when modifying
        const names = [...document.querySelectorAll(`table tbody .column-${columnId}`)].map(({ innerText }) => innerText);
        return names.length
            && names[valuesCheckingMode]((name) =>
                negation ? !RegExp(regexString).test(name) : RegExp(regexString).test(name));
    }, { timeout: 1500 }, columnId, expectedValuesRegex, valuesCheckingMode, negation);
};

/**
 * Tests whether sorting of main table by column with given id works properly
 * It is required there are a least two rows in the table
 * @param {puppeteer.Page} page the puppeteer page
 * @param {string} columnId subject column id
 * @return {Promise<void>} resolve once table sorting was successfully checked
 */
module.exports.testTableSortingByColumn = async (page, columnId) => {
    // Expect a sorting preview to appear when hovering over column header
    await page.waitForSelector(`th#${columnId}`);
    await page.hover(`th#${columnId}`);
    await page.waitForSelector(`#${columnId}-sort-preview`);

    const notOrderData = await getColumnCellsInnerTexts(page, columnId);

    // Sort in ASCENDING manner
    await this.pressElement(page, `th#${columnId}`);
    this.expectColumnValues(page, columnId, [...notOrderData].sort());

    // Sort in DESCENDING manner
    await this.pressElement(page, `th#${columnId}`);
    this.expectColumnValues(page, columnId, [...notOrderData].sort().reverse());

    // Revoke sorting
    await this.pressElement(page, `th#${columnId}`);
    this.expectColumnValues(page, columnId, notOrderData);
};

/**
 * Validate content of table body
 * @param {puppeteer.Page} page the puppeteer page
 * @param {Map<string, function<string, boolean>>} validators mapping of column names to cell data validator,
 * each validator must return value `true` if content is ok, false otherwise
 * @return {Promise<void>} resolve once data was successfully validated
 */
module.exports.validateTableData = async (page, validators) => {
    await page.waitForSelector('table tbody');
    for (const [columnId, validator] of validators) {
        const columnData = await getColumnCellsInnerTexts(page, columnId);
        expect(columnData, `Too few values for column ${columnId} or there is no such column`).to.be.length.greaterThan(0);
        expect(
            columnData.every((cellData) => validator(cellData)),
            `Invalid data in column ${columnId}: (${columnData})`,
        ).to.be.true;
    }
};

/**
 * Listener accepting browser confirmation dialog
 * @param {page.dialog} dialog dialog
 * @return {void}
 */
const acceptDialogEventListener = (dialog) => dialog.accept();

/**
 * Listener dismissing browser confirmation dialog
 * @param {page.dialog} dialog dialog
 * @return {void}
 */
const dismissDialogEventListener = (dialog) => dialog.dismiss();

/**
 * Set listener on dialog event to accept it
 * @param {puppeteer.page} page page handler
 * @return {void}
 */
module.exports.setConfirmationDialogToBeAccepted = (page) => {
    page.off('dialog', dismissDialogEventListener);
    page.on('dialog', acceptDialogEventListener);
};

/**
 * Set listener on dialog event to dismiss it
 * @param {puppeteer.page} page page handler
 * @return {void}
 */
module.exports.setConfirmationDialogToBeDismissed = (page) => {
    page.off('dialog', acceptDialogEventListener);
    page.on('dialog', dismissDialogEventListener);
};

/**
 * Unset accept and dismiss listeners off dialog event
 * @param {puppeteer.page} page page handler
 * @return {void}
 */
module.exports.unsetConfirmationDialogActions = (page) => {
    page.off('dialog', dismissDialogEventListener);
    page.off('dialog', acceptDialogEventListener);
};

/**
 * Expect a link to have a given text and href
 * @param {puppeteer.Page|puppeteer.ElementHandle} element Puppeteer element or page object.
 * @param {string} selector css selector.
 * @param {string} [expected.href] expected href of the link
 * @param {string} [expected.innerText] expected inner text of the link
 * @return {Promise<void>} promise
 */
module.exports.expectLink = async (element, selector, { href, innerText }) => {
    await element.waitForSelector(selector);
    const actualLinkProperties = await (await element.$(selector)).evaluate(({ innerText, href }) => ({ href, innerText }));
    expect(actualLinkProperties).to.eql({ href, innerText });
};

/**
 * Validate date string against given format
 * @param {string} date date (time) string
 * @param {string} [format = 'DD/MM/YYYY hh:mm:ss'] format to validate against
 * @return {boolean} true if format is correct, false otherwise
 */
module.exports.validateDate = (date, format = 'DD/MM/YYYY hh:mm:ss') => !isNaN(dateAndTime.parse(date, format));
