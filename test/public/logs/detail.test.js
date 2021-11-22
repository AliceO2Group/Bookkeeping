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
const { defaultBefore, defaultAfter, expectInnerText, pressElement } = require('../defaults');

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

    it('log detail loads correctly', async () => {
        await page.goto(`${url}/?page=log-detail&id=1`, { waitUntil: 'networkidle0' });

        // We expect there to be at least one post in this log entry
        const postExists = await page.$('#post1');
        expect(Boolean(postExists)).to.be.true;
    });

    it('notifies if a specified log id is invalid', async () => {
        // Navigate to a log detail view with an id that cannot exist
        await page.goto(`${url}/?page=log-detail&id=99999999`, { waitUntil: 'networkidle0' });

        // We expect there to be an error message
        const expectedMessage = 'Log with this id (99999999) could not be found';
        await expectInnerText(page, '.alert-danger', expectedMessage);
    });

    it('allows navigating to an associated run', async () => {
        const logId = 1;
        const runId = 1;

        // Navigate to a log detail view
        await page.goto(`${url}/?page=log-detail&id=${logId}`, { waitUntil: 'networkidle0' });
        const showAllButton = await page.$('#toggleCollapse');
        await showAllButton.click();
        await page.waitForTimeout(1000);
        // We expect the correct associated runs to be shown
        const runField = await page.$(`#post${logId}-runs`);
        const runText = await page.evaluate((element) => element.innerText, runField);
        expect(runText).to.equal(`Runs:\t\n${runId}`);

        // We expect the associated runs to be clickable with a valid link
        const runLink = await page.$(`#post${logId}-runs a`);
        await runLink.click();
        await page.waitForTimeout(1000);

        // We expect the link to navigate to the correct run detail page
        const redirectedUrl = await page.url();
        expect(redirectedUrl).to.equal(`${url}/?page=run-detail&id=${runId}&panel=main`);
    });

    it('should have a button to reply on a entry', async () => {
        const parentLogId = 2;
        await page.goto(`${url}/?page=log-detail&id=${parentLogId}`, { waitUntil: 'networkidle0' });

        // We expect there to be at least one post in this log entry
        await pressElement(page, `#reply-to-${parentLogId}`);
        await page.waitForTimeout(1000);

        const redirectedUrl = await page.url();
        expect(redirectedUrl).to.equal(`${url}/?page=log-create&parentLogId=${parentLogId}`);

        const title = 'Test the reply button';
        const text = 'Test the reply button';

        await page.type('#title', title);
        // eslint-disable-next-line no-undef
        await page.evaluate((text) => model.logs.editor.setValue(text), text);
        await page.waitForTimeout(250);

        // Create the new log
        const button = await page.$('button#send');
        await button.evaluate((button) => button.click());
        await page.waitForTimeout(1000);

        // Expect to be redirected to the new log
        const postSendUrl = await page.url();
        expect(postSendUrl.startsWith(`${url}/?page=log-detail`)).to.be.true;
    });
    it('can validate the empty title form', async () => {
        const parentLogId = 116;
        await page.goto(`${url}/?page=log-detail&id=${parentLogId}`, { waitUntil: 'networkidle0' });

        // We expect there to be at least one post in this log entry
        await pressElement(page, `#reply-to-${parentLogId}`);
        await page.waitForTimeout(1000);

        const redirectedUrl = await page.url();
        expect(redirectedUrl).to.equal(`${url}/?page=log-create&parentLogId=${parentLogId}`);

        const title = '';
        const text = 'Test the reply button';

        await page.type('#title', title);
        // eslint-disable-next-line no-undef
        await page.evaluate((text) => model.logs.editor.setValue(text), text);
        await page.waitForTimeout(250);

        const isDisabled = await page.$eval('button#send', (button) => button.disabled);
        expect(isDisabled).to.equal(false);
    });
};
