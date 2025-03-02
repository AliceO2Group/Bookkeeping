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
    expectUrlParams,
    waitForTimeout,
    waitForNavigation,
} = require('../defaults.js');
const { resetDatabaseContent } = require('../../utilities/resetDatabaseContent.js');

const { expect } = chai;

module.exports = () => {
    let page;
    let browser;
    let url;

    before(async () => {
        [page, browser, url] = await defaultBefore(page, browser);
        await resetDatabaseContent();
    });
    after(async () => {
        [page, browser] = await defaultAfter(page, browser);
    });

    it('log detail loads correctly and is opened as does not have children', async () => {
        await goToPage(page, 'log-detail', { queryParameters: { id: 5 } });

        // We expect to be the only log on page and opened
        await page.waitForSelector('#log-5');
        const openedLogs = await page.evaluate(() => window.model.logs.treeViewModel.detailedPostsIds);
        expect(openedLogs).to.have.lengthOf(1);
        expect(openedLogs[0]).to.equal(5);
    });

    it('should successfully expand the log specified in the URL and leave other ones closed', async () => {
        await goToPage(page, 'log-detail', { queryParameters: { id: 119 } });
        await page.waitForSelector('#log-117 .log-details-collapsed > *');

        // Expect other logs to be closed
        const closedLog1 = await page.$$('#log-117 .log-details-collapsed > *');

        const closedLog2 = await page.$$('#log-118 .log-details-collapsed > *');

        // Expect targeted log to contain more details than the collapsed ones
        const openedLog = await page.$$('#log-119 .log-details-expanded > *');
        expect(openedLog.length).to.be.greaterThan(closedLog1.length);
        expect(openedLog.length).to.be.greaterThan(closedLog2.length);
    });

    it('should display the log title on the log card if it is the same title as the parent log', async () => {
        await goToPage(page, 'log-detail', { queryParameters: { id: 119 } });

        await page.waitForSelector('#log-119 #log-119-title');

        const log117Title = await page.$('#log-117 #log-117-title');
        expect(log117Title).to.not.exist;
    });

    it('should display a button on each log for copying the url of the log', async () => {
        // Enable permissions to read/write to the clipboard. Ensure we keep sanitized write
        const context = browser.defaultBrowserContext();
        context.overridePermissions(url, ['clipboard-read', 'clipboard-write', 'clipboard-sanitized-write']);

        // Expect the button to be there. Log 117 should be a parent to 119.
        await pressElement(page, '#copy-117');

        // The url has log 119, but the clipboard should have the url for 117.
        const actualClipboardContents = await page.evaluate(() => navigator.clipboard.readText());
        const expectedClipboardContents = `${url}/?page=log-detail&id=117`;
        expect(actualClipboardContents).to.equal(expectedClipboardContents);
    });

    it('should display feedback to the user when the copy link button is clicked', async () => {
        // Expect the text before the click to be different after
        await expectInnerText(page, '#copy-118', 'Copy Link');
        await pressElement(page, '#copy-118');
        await expectInnerText(page, '#copy-118', 'Copied!');
    });

    it('should successfully expand opened log when displaying a log tree', async () => {
        await goToPage(page, 'log-detail', { queryParameters: { id: 1 } });

        // We expect there to be at least one log in this log entry
        page.waitForSelector('#log-1');
    });

    it('notifies if a specified log id is invalid', async () => {
        // Navigate to a log detail view with an id that cannot exist
        await goToPage(page, 'log-detail', { queryParameters: { id: 99999999 } });

        // We expect there to be an error message
        const expectedMessage = 'Log with this id (99999999) could not be found';
        await expectInnerText(page, '.alert-danger', expectedMessage);
    });

    it('allows navigating to an associated run', async () => {
        const logId = 1;
        const runNumber = 1;

        // Navigate to a log detail view
        await goToPage(page, 'log-detail', { queryParameters: { id: logId } });

        // We expect the correct associated runs to be shown
        await expectInnerText(page, `#log-${logId}-runs`, `Runs:\n${runNumber}`);

        // We expect the associated runs to be clickable with a valid link
        await waitForNavigation(page, () => pressElement(page, `#log-${logId}-runs a`));
        expectUrlParams(page, { page: 'run-detail', runNumber });
    });

    it('allows navigating to an associated environment', async () => {
        const logId = 1;
        const environmentId = '8E4aZTjY';

        await goToPage(page, 'log-detail', { queryParameters: { id: logId } });

        // We expect the correct associated environments to be shown
        await expectInnerText(page, `#log-${logId}-environments`, 'Environments:\n8E4aZTjY,\neZF99lH6');

        // We expect the associated environments to be clickable with a valid link
        await waitForNavigation(page, () => pressElement(page, `#log-${logId}-environments a`));
        expectUrlParams(page, { page: 'env-details', environmentId });
    });

    it('allows navigating to an associated LHC fill', async () => {
        const logId = 1;
        const fillNumbers = [5, 6];

        await goToPage(page, 'log-detail', { queryParameters: { id: logId } });

        // We expect the correct associated lhcFills to be shown
        await expectInnerText(page, `#log-${logId}-lhcFills`, `LHC Fills:\n${fillNumbers.join(',\n')}`);

        // We expect the associated lhcFills to be clickable with a valid link
        await waitForNavigation(page, () => pressElement(page, `#log-${logId}-lhcFills a`));
        expectUrlParams(page, { page: 'lhc-fill-details', fillNumber: fillNumbers[0] });
    });

    it('should have a button to reply on a entry', async () => {
        const parentLogId = 2;
        await goToPage(page, 'log-detail', { queryParameters: { id: parentLogId } });

        // We expect there to be at least one log in this log entry
        await waitForNavigation(page, () => pressElement(page, `#reply-to-${parentLogId}`));

        expectUrlParams(page, { page: 'log-reply', parentLogId });

        const text = 'Test the reply button';

        // eslint-disable-next-line no-undef
        await pressElement(page, '#text ~ .CodeMirror');
        await page.keyboard.type(text);
        await waitForTimeout(250);

        // Create the new log
        await waitForNavigation(page, () => pressElement(page, 'button#send'));
        expectUrlParams(page, { page: 'log-detail', id: 120 });
    });

    it('should successfully inherit parent log title', async () => {
        const parentLogId = 2;
        await goToPage(page, 'log-detail', { queryParameters: { id: parentLogId } });

        // We expect there to be at least one post in this log entry
        await waitForNavigation(page, () => pressElement(page, `#reply-to-${parentLogId}`));
        expectUrlParams(page, { page: 'log-reply', parentLogId });

        const text = 'Test the reply log creation with no title';

        // eslint-disable-next-line no-undef
        await pressElement(page, '#text ~ .CodeMirror');
        await page.keyboard.type(text);
        await waitForTimeout(250);

        const isDisabled = await page.$eval('button#send', (button) => button.disabled);
        expect(isDisabled).to.equal(false);

        await waitForNavigation(page, () => pressElement(page, 'button#send'));
        expectUrlParams(page, { page: 'log-detail', id: 121 });

        // Expect new log to inherit title of the parent
        const newLogId = await page.evaluate(() => window.model.router.params.id);
        const newLogTitleId = `#log-${newLogId}-title`;
        await page.waitForSelector(newLogTitleId);
        const newLogTitle = await page.$eval(newLogTitleId, (element) => element.innerText, newLogId);
        const parentLogTitle = await page.evaluate((parentLogId) => document.querySelector(`#log-${parentLogId}-title`).innerText, parentLogId);
        expect(newLogTitle).to.equal(`${parentLogTitle}`);
    });
};
