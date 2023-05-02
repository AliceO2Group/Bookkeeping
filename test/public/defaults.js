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

/**
 * Returns the URL with correct port postfixed.
 * @returns {String} URL specific to the port specified by user/host.
 */
const getUrl = () => `http://localhost:${server.address().port}`;

/**
 * Constructor to build elements before tests start.
 * @param {Object} page Puppeteer page object
 * @param {Object} browser Browser object to run tests on
 * @returns {Promise<Array>} Array of multiple objects, consisting of Page, Browser and Url.
 */
module.exports.defaultBefore = async (page, browser) => {
    browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    page = await browser.newPage();
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
 * Wait till selector is visible, then search for innertext on page.
 * @param {Object} page Puppeteer page object.
 * @param {String} selector Css selector.
 * @param {String} innerText Text to search for.
 * @returns {Promise<Boolean>} Whether the text was found on the page or not.
 */
module.exports.expectInnerText = async (page, selector, innerText) => {
    await page.waitForSelector(selector);
    const elementInnerText = await page.$eval(selector, (element) => element.innerText);
    expect(elementInnerText).to.equal(innerText);
};

/**
 * Waits till selector is visible and then clicks element.
 * @param {Object} page Puppeteer page object.
 * @param {String} selector Css selector.
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
 * @param {Page} puppeteerPage puppeteer page object
 * @param {string} url the URL to navigate to
 * @param {object} [options] navigation options
 * @param {boolean} [options.authenticate] if true, the navigation request will be authenticated with a token and test user information
 * @param {number} [options.redrawDuration] the estimated time to wait for the page to redraw
 * @returns {Promise} resolves with the navigation response
 */
const goTo = async (puppeteerPage, url, options) => {
    const { authenticate = true, redrawDuration = 20 } = options ?? {};

    const queryParameters = {};
    if (authenticate) {
        queryParameters.personid = 0;
        queryParameters.username = 'anonymous';
        queryParameters.name = 'Anonymous';
        queryParameters.access = 'admin';
        queryParameters.token = server.http.o2TokenService.generateToken(
            queryParameters.personid,
            queryParameters.username,
            queryParameters.name,
            queryParameters.access,
        );
    }

    const response = await puppeteerPage.goto(buildUrl(url, queryParameters), { waitUntil: 'networkidle0' });
    await puppeteerPage.waitForTimeout(redrawDuration);
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
    await page.waitForTimeout(redrawDuration);
};

/**
 * Validates if selector is present and returns the element.
 * @param {Object} page Puppeteer page object.
 * @param {String} selector Css selector.
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
 * @param {*} page Puppeteer page object.
 * @param {String} name Name of the screenshot taken. Useful when taking multiple in a row.
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
 * @param {String} selector Css selector.
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
 * @param {String} key The key for the column to gather entities of
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
 * Evaluate and return the html content of a given element handler
 * @param {{evaluate}} elementHandler the puppeteer handler of the element to inspect
 * @returns {Promise<XPathResult>} the html content
 */
const getInnerHtml = async (elementHandler) => await elementHandler.evaluate((element) => element.innerHTML);

module.exports.getInnerHtml = getInnerHtml;

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
    const cell = await page.$(`tbody tr td:nth-of-type(${columnIndex})`);
    const balloon = await cell.$('.popover');
    expect(balloon).to.not.be.null;
    const actualContent = await cell.$('.popover-actual-content');
    expect(actualContent).to.not.be.null;

    expect(await getInnerHtml(balloon)).to.be.equal(await getInnerHtml(actualContent));
};

/**
 * Fill the input at the given selector and triggers the given events on it
 *
 * @param {{evaluate: function, waitForSelector: function}} page the puppeteer's page object
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
 * Check the differences between the provided expected parameters and the parameters actually received
 *
 * For now only handle scalar parameters
 *
 * @param {url} page the puppeteer page
 * @param {Object} expectedUrlParameters the expected parameters as an object of key values
 * @return {Promise<Object>} the differences between the expected parameters
 */
module.exports.checkMismatchingUrlParam = async (page, expectedUrlParameters) => {
    const [, parametersExpr] = await page.url().split('?');
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
