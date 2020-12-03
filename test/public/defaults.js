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
const getUrl = ()=> `http://localhost:${server.address().port}`;

/**
 * Constructor to build elements before tests start.
 * @param {Object} page Puppeteer page object
 * @param {Object} browser Browser object to run tests on
 * @returns {Array} Array of multiple objects, consisting of Page, Browser and Url.
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
 * @returns {Array} Array of multiple objects, consisting of Page and Browser.
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
 * @param {Object} page Puppeteer page object
 * @param {String} selector Css selector
 * @param {String} innerText Text to search for
 * @returns {Boolean} Whether the text was found on the page or not.
 */
module.exports.expectInnerText = async (page, selector, innerText) => {
    await page.waitForSelector(selector);
    const elementInnerText = await page.$eval(selector, (element) => element.innerText);
    expect(elementInnerText).to.equal(innerText);
};

/**
 * Waits till selector is visible and then clicks element.
 * @param {Object} page Puppeteer page object
 * @param {String} selector Css selector
 * @returns {Promise} Whether the element was clickable or not.
 */
module.exports.pressElement = async (page, selector) => await Promise.all([
    page.waitForSelector(selector),
    page.click(selector),
]);

/**
 * Goes to a specific page and waits until everything is loaded.
 * @param {Object} page Puppeteer page object
 * @param {String} pageText Value of pageText in: URL/?page={pageText}&...
 * @returns {String} Switches the user to the correct page.
 */
module.exports.goToPage = (page, pageText) => page.goto(`${getUrl()}/?page=${pageText}`, { waitUntil: 'networkidle0' });

/**
 * Validates if selector is present and returns the element.
 * @param {Object} page Puppeteer page object
 * @param {String} selector Css selector
 * @returns {Object} Element matching the selector
 */
module.exports.validateElement = async (page, selector) => {
    await page.waitForSelector(selector);
    const element = page.$(selector);
    expect(Boolean(element)).to.be.true;
    return element;
};
