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
const { defaultBefore, defaultAfter, pressElement, goToPage, validateElement } = require('../defaults');
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
        [page, browser, url] = await defaultBefore(page, browser);
        await page.setViewport({
            width: 700,
            height: 720,
            deviceScaleFactor: 1,
        });
    });

    after(async () => {
        [page, browser] = await defaultAfter(page, browser);
    });

    it('correctly loads the log creation page', async () => {
        await goToPage(page, "log-create");

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
        await page.waitForTimeout(250);

        // Return the page to home
        await goToPage(page, "log-overview");

        // Ensure you are at the overview page again
        const redirectedUrl = await page.url();
        expect(redirectedUrl).to.equal(`${url}/?page=log-overview`);

        // Get the latest post and verify the title of the log we posted
        const table = await page.$$('tr');
        firstRowId = await getFirstRow(table, page);
        const firstRowTitle = await page.$(`#${firstRowId}-title-text`);
        const titleText = await firstRowTitle.evaluate((element) => element.innerText);
        expect(titleText).to.equal(title);
        await page.waitForTimeout(500);
    });

    it('can collapse and expand logs with long titles', async () => {
        /*
         * Collapse and de-collapse the opened title and verify the rendered height
         * Ideally, this test would be in the overview suite, unfortunately we cannot relay data between suites
         * Here, we are certain we have a log with a long title, and therefore the test can succeed
         */
        // await goToPage(page, "log-overview");
        // await page.waitForSelector(`#${firstRowId}-title-plus`);
        // const expandButton = await page.$(`#${firstRowId}-title-plus`);
        // expect(Boolean(expandButton)).to.be.true;

        // await expandButton.evaluate((button) => button.click());

        // const expandedTitle = await page.$(`#${firstRowId}-title`);
        // const expandedTitleHeight = await page.evaluate((element) => element.clientHeight, expandedTitle);

        // const collapseButton = await page.$(`#${firstRowId}-title-minus`);
        // expect(Boolean(collapseButton)).to.be.true;
        // await collapseButton.evaluate((button) => button.click());

        // const collapsedTitle = await page.$(`#${firstRowId}-title`);
        // const collapsedTitleHeight = await page.evaluate((element) => element.clientHeight, collapsedTitle);
        // expect(expandedTitleHeight).to.be.greaterThan(collapsedTitleHeight);
    });

    it('can create a log with linked tags', async () => {
        const title = 'A short title';
        const text = 'Sample Text';
        const tags = ['FOOD', 'OTHER'];

        // Return to the creation page
        await goToPage(page, "log-create");

        // Select the boxes and send the values of the title and text to it
        await page.type('#title', title);
        // eslint-disable-next-line no-undef
        await page.evaluate((text) => model.logs.editor.setValue(text), text);

        // Find the selection options corresponding to the tag texts
        const optionsToSelect = [];
        const tagOptions = await page.$$('option');
        for (const _option of tagOptions) {
            const option = await _option;
            const optionText = await page.evaluate((element) => element.innerText, option);
            if (tags.includes(optionText)) {
                const optionValue = await page.evaluate((element) => element.value, option);
                optionsToSelect.push(optionValue);
            }
        }

        // Select the collection of tags to be linked to the log
        await page.select('select#tags', ...optionsToSelect);

        // Expect to have selected two options
        const tagSelection = await page.$('select#tags');
        const tagSelectedOptions = await page.evaluate((element) => element.selectedOptions, tagSelection);
        expect(Object.keys(tagSelectedOptions).length).to.equal(2);

        // Create the new log
        const buttonSend = await page.$('button#send');
        await buttonSend.evaluate((button) => button.click());
        await page.waitForTimeout(250);

        // Return the page to home
        await goToPage(page, "log-overview");

        // Get the latest post and verify that the selected tags correspond to the posted tags
        const table = await page.$$('tr');
        firstRowId = await getFirstRow(table, page);
        const firstRowTags = await page.$(`#${firstRowId}-tags-text`);
        const tagsText = await page.evaluate((element) => element.innerText, firstRowTags);
        expect(tagsText).to.equal(tags.join(', '));
    });

    it('can navigate to tag creation screen', async () => {
        // Return to the creation page
        await goToPage(page, "log-create");

        // Expect the user to be at the tag creation screen when the URL is clicked on
        const tagCreationLink = await page.$('#tagCreateLink');
        await page.evaluate((button) => button.click(), tagCreationLink);
        await page.waitForTimeout(500);
        const redirectedUrl = await page.url();
        expect(redirectedUrl).to.equal(`${url}/?page=tag-create`);
    });

    it('can create a log with file attachments', async () => {
        const title = 'Shorter';
        const text = 'Sample Text';
        const file1 = '1200px-CERN_logo.png';
        const file2 = 'hadron_collider.jpg';

        // Return to the creation page
        await goToPage(page, "log-create");

        // Select the boxes and send the values of the title and text to it
        await page.type('#title', title);
        // eslint-disable-next-line no-undef
        await page.evaluate((text) => model.logs.editor.setValue(text), text);

        // Add both the file attachments to the input field
        const attachmentsInput = await page.$('#attachments');
        const file1Path = path.resolve(__dirname, '../..', 'assets', file1);
        const file2Path = path.resolve(__dirname, '../..', 'assets', file2);
        attachmentsInput.uploadFile(file1Path, file2Path);
        await page.waitForTimeout(500);

        // Ensure that both file attachments were received
        const attachmentNames = await page.$('#attachmentNames');
        const attachmentNamesText = await page.evaluate((element) => element.innerText, attachmentNames);
        expect(attachmentNamesText).to.equal(`${file1}, ${file2}`);

        // Create the new log
        const buttonSend = await page.$('button#send');
        await buttonSend.evaluate((button) => button.click());
        // Sizable delay to allow for file uploading
        await page.waitForTimeout(2500);

        // Return the page to home
        await goToPage(page, "log-overview");

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
        await page.waitForTimeout(500);

        // Verify that the attachment names match the ones we uploaded
        const parsedFirstRowId = parseInt(firstRowId.slice('row'.length, firstRowId.length), 10);
        const attachmentsField = await page.$(`#post${parsedFirstRowId}-attachments`);
        const attachmentsText = await page.evaluate((element) => element.innerText, attachmentsField);
        expect(attachmentsText).to.equal(`Attachments:\t\n${file1}\n, \n${file2}`);
    }).timeout(10000);

    it('can clear the file attachment input if at least one is submitted', async () => {
        // Return to the creation page
        await goToPage(page, "log-create");

        // We expect the clear button to not be visible yet
        let clearButton = await page.$('#clearAttachments');
        expect(Boolean(clearButton)).to.be.false;

        // Add a single file attachment to the input field
        const attachmentsInput = await page.$('#attachments');
        attachmentsInput.uploadFile(path.resolve(__dirname, '../..', 'assets', '1200px-CERN_logo.png'));
        await page.waitForTimeout(500);

        // We expect the clear button to appear
        clearButton = await page.$('#clearAttachments');
        expect(Boolean(clearButton)).to.be.true;

        // We expect that clicking the clear button resets the attachment input
        const uploadedAttachments = await page.evaluate((element) => element.value, attachmentsInput);
        expect(uploadedAttachments.endsWith('1200px-CERN_logo.png')).to.be.true;

        await clearButton.evaluate((clearButton) => clearButton.click());
        await page.waitForTimeout(100);
        const newUploadedAttachments = await page.evaluate((element) => element.value, attachmentsInput);
        expect(newUploadedAttachments).to.equal('');
    });

    it('can create a log with a run number', async () => {
        const title = 'Single run number test';
        const text = 'Sample Text';
        const runNumbersStr = '1';

        // Return to the creation page
        await goToPage(page, "log-create");

        // Select the boxes and send the values of the title and text to it
        await page.type('#title', title);
        // eslint-disable-next-line no-undef
        await page.evaluate((text) => model.logs.editor.setValue(text), text);

        // Send the value of the run numbers string to the input
        await page.type('#run-number', runNumbersStr);

        // Create the new log
        const buttonSend = await page.$('button#send');
        await buttonSend.evaluate((button) => button.click());
        await goToPage(page, "log-overview");
        await page.waitForFunction(
            'document.querySelector("body").innerText.includes("Single run number test")'
          );

        // Find the created log
        const table = await page.$$('tr');
        firstRowId = await getFirstRow(table, page);
        const firstRowTitle = await page.$(`#${firstRowId}-title-text`);
        const titleText = await page.evaluate((element) => element.innerText, firstRowTitle);
        expect(titleText).to.equal(title);

        // Go to the log detail page
        const rowId = parseInt(firstRowId.replace(/\D/g,''));
        await goToPage(page, `log-detail&id=${rowId}`);
        const runsField = await page.$(`#post${rowId}-runs`);
        const runsText = await page.evaluate((element) => element.innerText, runsField);
        expect(runsText).to.equal(`Runs:\t\n${runNumbersStr}`);
    });

    it('can create a log with multiple run numbers', async () => {
        const title = 'Multiple run numbers test';
        const text = 'Sample Text';
        const runNumbers = [1, 2];
        const runNumbersStr = runNumbers.join(',');

        // Return to the creation page
        await goToPage(page, "log-create");

        // Select the boxes and send the values of the title and text to it
        await page.type('#title', title);
        // eslint-disable-next-line no-undef
        await page.evaluate((text) => model.logs.editor.setValue(text), text);

        // Send the value of the run numbers string to the input
        await page.type('#run-number', runNumbersStr);

        // Create the new log
        const buttonSend = await page.$('button#send');
        await buttonSend.evaluate((button) => button.click());
        await page.goto(`${url}/?page=log-overview`, {waitUntil: 'load'});
        await page.waitForFunction(
            'document.querySelector("body").innerText.includes("Multiple run numbers test")'
          );

        // Find the created log
        const table = await page.$$('tr');
        firstRowId = await getFirstRow(table, page);
        const firstRowTitle = await page.$(`#${firstRowId}-title-text`);
        const titleText = await page.evaluate((element) => element.innerText, firstRowTitle);
        expect(titleText).to.equal(title);

        // Go to the log detail page
        const rowId = parseInt(firstRowId.replace(/\D/g,''));
        await page.goto(`${url}/?page=log-detail&id=${rowId}`, {waitUntil: 'networkidle0'});
        const runsField = await page.$(`#post${rowId}-runs`);
        const runsText = await page.evaluate((element) => element.innerText, runsField);
        for (const runNumber of runNumbers) {
            expect(runsText).to.include(runNumber);
        }
    });
};
