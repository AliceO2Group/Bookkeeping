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

    await Promise.all([
        page.coverage.startJSCoverage({ resetOnNavigation: false }),
        page.coverage.startCSSCoverage(),
    ]);

    return [page, browser, getUrl()];
};

/**
 * Destructor to cleanup after tests are finished.
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
 * Execute the given navigation function and wait for navigation
 *
 * @param {puppeteer.Page} page the puppeteer page
 * @param {function} navigateFunction function to call to initiate navigation
 * @return {Promise<*>} resolves once the navigation finished
 */
const waitForNavigation = (page, navigateFunction) => Promise.all([
    page.waitForNavigation({ timeout: 1500 }),
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
    await page.waitForSelector(selector);

    if (jsClick) {
        await page.$eval(selector, (element) => {
            element.click();
        });
    } else {
        await page.click(selector);
    }
};

/**
 * Reload the current page and wait for it to be loaded
 * @param {Page} puppeteerPage Puppeteer page object.
 * @return {Promise} resolves when the page has loaded
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
    const { authenticate = true, redrawDuration = 20 } = options ?? {};

    if (authenticate) {
        url = authenticateUrl(url);
    }

    const response = await page.goto(url, { waitUntil: 'networkidle0' });
    await waitForTimeout(redrawDuration);
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
 * Wait for page network idle and add a small timeout to let the page redraw
 *
 * @param {Object} page the puppeteer page object
 * @param {Object} [options] eventual options
 * @param {number} [options.redrawDuration] duration of the page redraw (in ms)
 * @return {Promise<void>} resolves once the page is fully redraw
 */
module.exports.waitForNetworkIdleAndRedraw = async (page, options) => {
    const { redrawDuration = 20 } = options ?? {};

    await page.waitForNetworkIdle();
    await waitForTimeout(redrawDuration);
};

/**
 * Validates if selector is present and returns the element.
 * @param {Object} page Puppeteer page object.
 * @param {string} selector Css selector.
 * @returns {Object} Element matching the selector.
 */
module.exports.validateElement = async (page, selector) => {
    await page.waitForSelector(selector);
    const element = page.$(selector);
    expect(Boolean(element)).to.be.true;
    return element;
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
 * Validates if selector is present and returns the element.
 * @param {Object} page Puppeteer page object.
 * @param {string} selector Css selector.
 * @param {Object} value value that is expected at the Css selector element.
 * @returns {Object} Element matching the selector
 */
module.exports.validateElementEqualTo = async (page, selector, value) => {
    await page.waitForSelector(selector);
    const element = await page.$$(selector);
    expect(Boolean(element)).to.be.true;
    expect(element.length).to.equal(value);
    return element;
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
 * Special method built to gather all currently visible table entities from a specific column into an array
 * @param {Object} page An object representing the browser page being used by Puppeteer
 * @param {string} key The key for the column to gather entities of
 * @return {Promise<Array>} An array containing all table entities of a column, in the order displayed by the browser
 */
module.exports.getAllDataFields = async (page, key) => {
    const allData = await page.$$('td');
    return await allData.reduce(async (accumulator, data) => {
        const id = await page.evaluate((element) => element.id, data);
        if (id.endsWith(`-${key}`)) {
            const text = await page.evaluate((element) => element.innerText, data);
            (await accumulator).push(text);
        }
        return accumulator;
    }, []);
};

/**
 * Evaluate and return the text content of a given element handler
 * @param {{evaluate}} elementHandler the puppeteer handler of the element to inspect
 * @returns {Promise<XPathResult>} the html content
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
    await page.waitForSelector(selector, { timeout: 200 });
    expect(await getInnerText(await page.$(selector))).to.equal(innerText);
};

/**
 * Expect an element to have a text valid against givne validator
 * @param {Object} page Puppeteer page object.
 * @param {string} selector Css selector.
 * @param {function<string, boolean>} validator text validator. It must return true if text is valid, retrun false or throw otherwise
 * @return {Promise<void>} resolves once the text has been checked
 */
module.exports.expectInnerTextTo = async (page, selector, validator) => {
    await page.waitForSelector(selector, { timeout: 200 });
    const actualInnerText = await getInnerText(await page.$(selector));
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
 * Extract the content of a popover corresponding to a popover trigger
 *
 * @param {object} popoverTrigger the puppeteer element of the popover trigger
 * @return {Promise<string>} the content of the trigger
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
 * Check that the fist cell of the given column contains a popover displayed if the text overflows (named balloon) and that the popover's
 * content is correct
 *
 * @param {{$: function}} page the puppeteer page
 * @param {number} rowIndex the index of the row to look for balloon presence
 * @param {number} columnIndex the index of the column to look for balloon presence
 * @returns {Promise<void>} void promise
 */
module.exports.checkColumnBalloon = async (page, rowIndex, columnIndex) => {
    const cell = await page.$(`tbody tr:nth-of-type(${rowIndex}) td:nth-of-type(${columnIndex})`);
    const popoverTrigger = await cell.$('.popover-trigger');
    const triggerContent = await popoverTrigger.evaluate((evaluate) => evaluate.querySelector('.w-wrapped').innerHTML);

    const actualContent = await getPopoverContent(popoverTrigger);

    expect(triggerContent).to.be.equal(actualContent);
};

/**
 * Check that a given cell of the given column displays the correct color depending on the status
 *
 * @param {{$: function}} page the puppeteer page
 * @param {number} rowIndex the index of the row to look for status color
 * @param {number} columnIndex the index of the column to look for status color
 * @returns {Promise<Chai.Assertion>} void promise
 */
module.exports.checkEnvironmentStatusColor = async (page, rowIndex, columnIndex) => {
    const cellStatus = await page.$(`tbody tr:nth-of-type(${rowIndex}) td:nth-of-type(${columnIndex})`);
    const cell = await page.$(`tbody tr:nth-of-type(${rowIndex})`);
    const cellStatusContent = await getInnerHtml(cellStatus);

    switch (cellStatusContent) {
        case 'RUNNING':
            expect(await cell.$('.success')).to.not.be.null;
            break;
        case 'ERROR':
            expect(await cell.$('.danger')).to.not.be.null;
            break;
        case 'CONFIGURED':
            expect(await cell.$('.warning')).to.not.be.null;
            break;
    }
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
 * @param {{evaluate}} inputElementHandler the puppeteer handler of the element to inspect
 * @returns {Promise<XPathResult>} the html content
 */
const getInputValue = async (inputElementHandler) => await inputElementHandler.evaluate((input) => input.value);

/**
 * Expect an element to have a given value
 *
 * @param {Object} page Puppeteer page object.
 * @param {string} selector Css selector.
 * @param {string} value value to search for.
 * @return {Promise<void>} resolves once the value has been checked
 */
module.exports.expectInputValue = async (page, selector, value) => {
    await page.waitForSelector(selector, { timeout: 200 });
    expect(await getInputValue(await page.$(selector))).to.equal(value);
};

/**
 * Check the differences between the provided expected parameters and the parameters actually received
 *
 * @TODO convert this to not-async
 * For now only handle scalar parameters
 *
 * @param {puppeteer.Page} page the puppeteer page
 * @param {Object} expectedUrlParameters the expected parameters as an object of key values
 * @return {Promise<Object>} the differences between the expected parameters
 */
module.exports.checkMismatchingUrlParam = async (page, expectedUrlParameters) => {
    const [, parametersExpr] = page.url().split('?');
    const urlParameters = parametersExpr.split('&');
    const ret = {};
    for (const urlParameter of urlParameters) {
        const [key, value] = urlParameter.split('=');
        if (expectedUrlParameters[key] !== value) {
            ret[key] = {
                expected: expectedUrlParameters[key],
                actual: value,
            };
        }
    }
    return ret;
};

/**
 * Call a trigger function, wait for the table to display a loading spinner then wait for the loading spinner to be removed.
 * @param {puppeteer.Page} page the puppeteer page
 * @param {function} triggerFunction function called to trigger table data loading
 * @return {Promise} promise
 */
module.exports.waitForTableDataReload = (page, triggerFunction) => Promise.all([
    page.waitForSelector('table .atom-spinner'),
    triggerFunction(),
]).then(() => page.waitForSelector('table .atom-spinner', { hidden: true }));

/**
 * Tests whether sorting of main table by column with given id works properly
 * It is required there are a least two rows in the table
 * @param {puppeteer.Page} page the puppeteer page
 * @param {string} columnId subject column id
 * @return {Promise<void>} promise
 */
module.exports.testTableSortingByColumn = async (page, columnId) => {
    // Expect a sorting preview to appear when hovering over column header
    await page.waitForSelector(`th#${columnId}`, { timeout: 250 });
    await page.hover(`th#${columnId}`);
    const sortingPreviewIndicator = await page.$(`#${columnId}-sort-preview`);
    expect(Boolean(sortingPreviewIndicator)).to.be.true;

    const notOrderData = await this.getAllDataFields(page, columnId);

    // Sort in ASCENDING manner
    await this.waitForTableDataReload(page, () => this.pressElement(`th#${columnId}`));

    let targetColumnValues = await this.getAllDataFields(page, columnId);
    expect(targetColumnValues, `Too few values for ${columnId} column or there is no such column`).to.be.length.greaterThan(1);
    expect(targetColumnValues).to.have.all.deep.ordered.members(targetColumnValues.sort());

    // Sort in DESCSENDING manner
    await this.waitForTableDataReload(page, () => this.pressElement(`th#${columnId}`));

    targetColumnValues = await this.getAllDataFields(page, columnId);
    expect(targetColumnValues, `Too few values for ${columnId} column or there is no such column`).to.be.length.greaterThan(1);
    expect(targetColumnValues).to.have.all.deep.ordered.members(targetColumnValues.sort().reverse());

    // Revoke sorting
    targetColumnValues = await this.getAllDataFields(page, columnId);
    expect(targetColumnValues).to.have.all.ordered.members(notOrderData);
};

/**
 * Validate content of table body
 * @param {puppeteer.Page} page the puppeteer page
 * @param {Map<string, function<string, boolean>>} validators mapping of column names to cell data validator,
 * each validator must return value `true` if content is ok, false otherwise
 * @return {Promise<void>} promise
 */
module.exports.validateTableData = async (page, validators) => {
    await page.waitForSelector('table tbody');
    for (const [columnId, validator] of validators) {
        const columnData = await this.getAllDataFields(page, columnId);
        expect(columnData, `Too few values for column ${columnId} or there is no such column`).to.be.length.greaterThan(0);
        expect(
            columnData.every((cellData) => validator(cellData)),
            `Invalid data in column ${columnId}: (${columnData})`,
        ).to.be.true;
    }
};
