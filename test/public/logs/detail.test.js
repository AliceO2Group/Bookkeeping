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
const { defaultBefore, defaultAfter, expectInnerText, pressElement, goToPage } = require('../defaults');

const { expect } = chai;

module.exports = () => {
    let page;
    let browser;
    let url;

    before(async () => {
        [page, browser, url] = await defaultBefore(page, browser);
    });
    after(async () => {
        [page, browser] = await defaultAfter(page, browser);
    });

    it('log detail loads correctly and is opened as does not have children', async () => {
        await goToPage(page, 'log-detail', { queryParameters: { id: 5 } });

        // We expect to be the only log on page and opened
        const postExists = await page.$('#log-5');
        const openedLogs = await page.evaluate(() => window.model.logs.treeViewModel.detailedPostsIds);
        expect(openedLogs).to.have.lengthOf(1);
        expect(openedLogs[0]).to.equal(5);
        expect(Boolean(postExists)).to.be.true;
    });

    it('should successfully expand the log specified in the URL and leave other ones closed', async () => {
        await goToPage(page, 'log-detail', { queryParameters: { id: 119 } });

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

        const log117Title = await page.$('#log-117 #log-117-title');
        const log119Title = await page.$('#log-119 #log-119-title');
        expect(log117Title).to.not.exist;
        expect(log119Title).to.exist;
    });

    it('should display a button on each log for copying the url of the log', async () => {
        // Enable permissions to read/write to the clipboard. Ensure we keep sanitized write
        const context = browser.defaultBrowserContext();
        context.overridePermissions(url, ['clipboard-read', 'clipboard-write', 'clipboard-sanitized-write']);

        await goToPage(page, 'log-detail', { queryParameters: { id: 119 } });

        // Expect the button to be there. Log 117 should be a parent to 119.
        const log117CopyBtn = await page.$('#copy-117');
        expect(log117CopyBtn).to.exist;

        await log117CopyBtn.click();

        // The url has log 119, but the clipboard should have the url for 117.
        const actualClipboardContents = await page.evaluate(() => navigator.clipboard.readText());
        const expectedClipboardContents = `${url}/?page=log-detail&id=117`;
        expect(actualClipboardContents).to.equal(expectedClipboardContents);
    });

    it('should display feedback to the user when the copy link button is clicked', async () => {
        await goToPage(page, 'log-detail', { queryParameters: { id: 119 } });

        // Expect the button to be there. Log 117 should be a parent to 119.
        const log117CopyBtn = await page.$('#copy-117');
        expect(log117CopyBtn).to.exist;

        // Expect the text before the click to be different after
        await expectInnerText(page, '#copy-117', 'Copy Link');
        await log117CopyBtn.click();
        await page.waitForTimeout(100);
        await expectInnerText(page, '#copy-117', 'Copied!');
    });

    it('should successfuly expand opened log when displaying a log tree', async () => {
        await goToPage(page, 'log-detail', { queryParameters: { id: 1 } });

        // We expect there to be at least one log in this log entry
        const postExists = await page.$('#log-1');
        expect(Boolean(postExists)).to.be.true;
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
        const runId = 1;

        // Navigate to a log detail view
        await goToPage(page, 'log-detail', { queryParameters: { id: logId } });
        const showAllButton = await page.$('#toggleCollapse');
        await showAllButton.click();
        await page.waitForTimeout(1000);
        // We expect the correct associated runs to be shown
        const runField = await page.$(`#log-${logId}-runs`);
        const runText = await page.evaluate((element) => element.innerText, runField);
        expect(runText).to.equal(`Runs:\n${runId}`);

        // We expect the associated runs to be clickable with a valid link
        const runLink = await page.$(`#log-${logId}-runs a`);
        await runLink.click();
        await page.waitForTimeout(1000);

        // We expect the link to navigate to the correct run detail page
        const redirectedUrl = await page.url();
        expect(redirectedUrl).to.equal(`${url}/?page=run-detail&id=${runId}`);
    });

    it('should have a button to reply on a entry', async () => {
        const parentLogId = 2;
        await goToPage(page, 'log-detail', { queryParameters: { id: parentLogId } });

        // We expect there to be at least one log in this log entry
        await pressElement(page, `#reply-to-${parentLogId}`);
        await page.waitForTimeout(1000);

        const redirectedUrl = await page.url();
        expect(redirectedUrl).to.equal(`${url}/?page=log-create&parentLogId=${parentLogId}`);

        const text = 'Test the reply button';

        // eslint-disable-next-line no-undef
        await page.evaluate((text) => model.logs.creationModel.textEditor.setValue(text), text);
        await page.waitForTimeout(250);

        // Create the new log
        const button = await page.$('button#send');
        await button.evaluate((button) => button.click());
        await page.waitForTimeout(1000);

        // Expect to be redirected to the new log
        const postSendUrl = await page.url();
        expect(postSendUrl.startsWith(`${url}/?page=log-detail`)).to.be.true;
    });

    it('should successfully inherit parent log title', async () => {
        const parentLogId = 2;
        await goToPage(page, 'log-detail', { queryParameters: { id: parentLogId } });

        // We expect there to be at least one post in this log entry
        await pressElement(page, `#reply-to-${parentLogId}`);
        await page.waitForTimeout(1000);

        const redirectedUrl = await page.url();
        expect(redirectedUrl).to.equal(`${url}/?page=log-create&parentLogId=${parentLogId}`);

        const text = 'Test the reply log creation with no title';

        // eslint-disable-next-line no-undef
        await page.evaluate((text) => model.logs.creationModel.textEditor.setValue(text), text);
        await page.waitForTimeout(250);

        const isDisabled = await page.$eval('button#send', (button) => button.disabled);
        expect(isDisabled).to.equal(false);

        const button = await page.$('button#send');
        await button.evaluate((button) => button.click());
        await page.waitForTimeout(1000);

        // Expect to be redirected to the new log
        const postSendUrl = await page.url();
        expect(postSendUrl.startsWith(`${url}/?page=log-detail`)).to.be.true;

        // Expect new log to inherit title of the parent
        const newLogId = await page.evaluate(() => window.model.router.params.id);
        const newLogTitle = await page.evaluate((newLogId) => document.querySelector(`#log-${newLogId}-title`).innerText, newLogId);
        const parentLogTitle = await page.evaluate((parentLogId) => document.querySelector(`#log-${parentLogId}-title`).innerText, parentLogId);
        expect(newLogTitle).to.equal(`${parentLogTitle}`);
    });
};
