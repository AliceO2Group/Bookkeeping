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
    browser = await puppeteer.launch({ args: ['--no-sandbox'] });
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
 * @returns {Promise} Whether the element was clickable or not.
 */
module.exports.pressElement = async (page, selector) => {
    await page.waitForSelector(selector);
    await page.click(selector);
};

/**
 * Goes to a specific page and waits until everything is loaded.
 * @param {Object} page Puppeteer page object.
 * @param {String} pageText Value of pageText in: URL/?page={pageText}&...
 * @returns {String} Switches the user to the correct page.
 */
module.exports.goToPage = (page, pageText) => page.goto(`${getUrl()}/?page=${pageText}`, { waitUntil: 'networkidle0' });

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
 * Check that the fist cell of the given column contains a balloon and that the balloon's content is correct
 *
 * @param {{$: function}} page the puppeteer page
 * @param {number} rowIndex the index of the row to look for balloon presence
 * @param {number} columnIndex the index of the column to look for balloon presence
 * @returns {Promise<void>} void promise
 */
module.exports.checkColumnBalloon = async (page, rowIndex, columnIndex) => {
    const cell = await page.$(`tbody tr td:nth-of-type(${columnIndex})`);
    const balloon = await cell.$('.balloon');
    expect(balloon).to.not.be.null;
    const actualContent = await cell.$('.balloon-actual-content');
    expect(actualContent).to.not.be.null;

    expect(await getInnerHtml(balloon)).to.be.equal(await getInnerHtml(actualContent));
};
