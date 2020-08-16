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
const { server } = require('../../../lib/application');
const path = require('path');

const { expect } = chai;

/**
 * Special method built due to Puppeteer limitations: looks for the first row matching an ID in a table
 * @param {Object} table An HTML element representing the entire log table
 * @param {Object} page An object representing the browser page being used by Puppeteer
 * @return {Promise<String>} The ID of the first matching row with data
 */
async function getFirstRow(table, page) {
    for await (const child of table) {
        const id = await page.evaluate((element) => element.id, child);
        if (id.startsWith('row')) {
            return id;
        }
    }
}

module.exports = () => {
    let page;
    let browser;
    let url;

    let firstRowId;

    before(async () => {
        browser = await puppeteer.launch({ args: ['--no-sandbox'] });
        page = await browser.newPage();
        await Promise.all([
            page.coverage.startJSCoverage({ resetOnNavigation: false }),
            page.coverage.startCSSCoverage(),
        ]);

        const { port } = server.address();
        url = `http://localhost:${port}`;
    });

    after(async () => {
        const [jsCoverage, cssCoverage] = await Promise.all([
            page.coverage.stopJSCoverage(),
            page.coverage.stopCSSCoverage(),
        ]);

        pti.write([...jsCoverage, ...cssCoverage].filter(({ url = '' } = {}) => url.match(/\.(js|css)$/)));
        await browser.close();
    });

    it('correctly loads the log creation page', async () => {
        await page.goto(`${url}/?page=create-log-entry`);
        await page.waitFor(100);

        // We expect the log creation screen to be shown correctly
        const header = await page.$('h2');
        expect(Boolean(header)).to.be.true;
        const headerText = await page.evaluate((element) => element.innerText, header);
        expect(headerText).to.equal('Create Log');
    });

    it('can create a log', async () => {
        const title = 'A very long title that should be collapsed in the overview screen!' +
            'Adding some more text to it, does it have an ellipsis yet? I do not know!';
        const text = 'Sample Text';

        // Select the boxes and send the values of the title and text to it
        await page.type('#title', title);
        // eslint-disable-next-line no-undef
        await page.evaluate((text) => model.logs.editor.setValue(text), text);

        // Verify that the text from the first matches with the text posted and correct working of the redirect
        // eslint-disable-next-line no-undef
        const doesContentMatch = JSON.stringify(await page.evaluate(() => model.logs.editors[0].getValue()))
            .includes(text);
        expect(doesContentMatch).to.equal(true);

        // Create the new log
        const buttonSend = await page.$('button#send');
        await buttonSend.evaluate((button) => button.click());
        await page.waitFor(250);

        // Return the page to home
        const buttonHome = await page.$('#home');
        await buttonHome.evaluate((button) => button.click());
        await page.waitFor(250);

        // Ensure you are at the overview page again
        const redirectedUrl = await page.url();
        expect(redirectedUrl).to.equal(`${url}/?page=home`);

        // Get the latest post and verify the title of the log we posted
        const table = await page.$$('tr');
        firstRowId = await getFirstRow(table, page);
        const firstRowTitle = await page.$(`#${firstRowId}-title-text`);
        const titleText = await firstRowTitle.evaluate((element) => element.innerText);
        expect(titleText).to.equal(title);
    });

    it('can create a log with file attachments', async () => {
        const title = 'A shorter title';
        const text = 'Sample Text';
        const file1 = '1200px-CERN_logo.png';
        const file2 = 'hadron_collider.jpg';

        // Return to the creation page
        await page.click('#create');
        await page.waitFor(500);

        // Select the boxes and send the values of the title and text to it
        await page.type('#title', title);
        // eslint-disable-next-line no-undef
        await page.evaluate((text) => model.logs.editor.setValue(text), text);

        // Add both the file attachments to the input field
        const attachmentsInput = await page.$('#attachments');
        const file1Path = path.resolve(__dirname, '../..', 'assets', file1);
        const file2Path = path.resolve(__dirname, '../..', 'assets', file2);
        attachmentsInput.uploadFile(file1Path, file2Path);
        await page.waitFor(500);

        // Ensure that both file attachments were received
        const attachmentNames = await page.$('#attachmentNames');
        const attachmentNamesText = await page.evaluate((element) => element.innerText, attachmentNames);
        expect(attachmentNamesText).to.equal(`${file1}, ${file2}`);

        // Create the new log
        const buttonSend = await page.$('button#send');
        await buttonSend.evaluate((button) => button.click());
        // Sizable delay to allow for file uploading
        await page.waitFor(2500);

        // Return the page to home
        const buttonHome = await page.$('#home');
        await buttonHome.evaluate((button) => button.click());
        await page.waitFor(250);

        // Ensure you are at the overview page again
        const redirectedUrl = await page.url();
        expect(redirectedUrl).to.equal(`${url}/?page=home`);

        // Get the latest post and verify the title of the log we posted
        const table = await page.$$('tr');
        firstRowId = await getFirstRow(table, page);
        const firstRowTitle = await page.$(`#${firstRowId}-title-text`);
        const titleText = await page.evaluate((element) => element.innerText, firstRowTitle);
        expect(titleText).to.equal(title);

        // Verify that this log has two attachments, as was submitted
        const firstRowAttachmentsCount = await page.$(`#${firstRowId}-attachments-text`);
        const attachmentsCountText = await page.evaluate((element) => element.innerText, firstRowAttachmentsCount);
        expect(attachmentsCountText).to.equal('2');

        // Go to the log detail page
        const row = await page.$(`tr#${firstRowId}`);
        await row.evaluate((row) => row.click());
        await page.waitFor(500);

        // Verify that the attachment names match the ones we uploaded
        const parsedFirstRowId = parseInt(firstRowId.slice('row'.length, firstRowId.length), 10);
        const attachmentsField = await page.$(`#post${parsedFirstRowId}-attachments`);
        const attachmentsText = await page.evaluate((element) => element.innerText, attachmentsField);
        expect(attachmentsText).to.equal(`Attachments:\t\n${file1}\n, \n${file2}`);
    });

    it('can clear the file attachment input if at least one is submitted', async () => {
        // Return to the creation page
        await page.click('#home');
        await page.waitFor(500);
        await page.click('#create');
        await page.waitFor(500);

        // We expect the clear button to not be visible yet
        let clearButton = await page.$('#clearAttachments');
        expect(Boolean(clearButton)).to.be.false;

        // Add a single file attachment to the input field
        const attachmentsInput = await page.$('#attachments');
        attachmentsInput.uploadFile(path.resolve(__dirname, '../..', 'assets', '1200px-CERN_logo.png'));
        await page.waitFor(500);

        // We expect the clear button to appear
        clearButton = await page.$('#clearAttachments');
        expect(Boolean(clearButton)).to.be.true;

        // We expect that clicking the clear button resets the attachment input
        const uploadedAttachments = await page.evaluate((element) => element.value, attachmentsInput);
        expect(uploadedAttachments.endsWith('1200px-CERN_logo.png')).to.be.true;

        await clearButton.evaluate((clearButton) => clearButton.click());
        await page.waitFor(100);
        const newUploadedAttachments = await page.evaluate((element) => element.value, attachmentsInput);
        expect(newUploadedAttachments).to.equal('');
    });
};
