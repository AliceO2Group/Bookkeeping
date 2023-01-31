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
const { defaultBefore, defaultAfter, goToPage, getFirstRow } = require('../defaults');
const path = require('path');

const { expect } = chai;

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
        await goToPage(page, 'log-create');

        // We expect the log creation screen to be shown correctly
        const header = await page.$('h3');
        expect(Boolean(header)).to.be.true;
        const headerText = await page.evaluate((element) => element.innerText, header);
        expect(headerText).to.equal('New log');
    });

    it('can create a log', async () => {
        const title = 'A very long title that should be collapsed in t...';
        const text = 'Sample Text';

        // Select the boxes and send the values of the title and text to it
        await page.type('#title', title);
        // eslint-disable-next-line no-undef
        await page.evaluate((text) => model.logs.creationModel.textEditor.setValue(text), text);

        // Wait for the button to not be disabled
        await page.waitForTimeout(50);

        // Create the new log
        const buttonSend = await page.$('button#send');
        await buttonSend.evaluate((button) => button.click());
        await page.waitForNavigation();

        // Return the page to home
        await goToPage(page, 'log-overview');
        await page.waitForNetworkIdle();
        await page.waitForTimeout(100);

        // Ensure you are at the overview page again
        const redirectedUrl = await page.url();
        expect(redirectedUrl).to.equal(`${url}/?page=log-overview`);
        await page.waitForTimeout(100);

        // Get the latest post and verify the title of the log we posted
        const table = await page.$$('tr');
        firstRowId = await getFirstRow(table, page);
        const firstRowTitle = await page.$(`#${firstRowId}-title .popover-actual-content`);
        const titleText = await firstRowTitle.evaluate((element) => element.innerText);
        expect(titleText).to.equal(title);
    });

    it('can disable submit with invalid data', async () => {
        const title = 'A';
        const text = 'Sample Text';

        await goToPage(page, 'log-create');
        // Select the boxes and send the values of the title and text to it
        await page.type('#title', title);
        // eslint-disable-next-line no-undef
        await page.evaluate((text) => model.logs.creationModel.textEditor.setValue(text), text);

        // Create check disabled button
        const isDisabled = await page.$eval('button#send', (button) => button.disabled);

        expect(isDisabled).to.equal(true);
    });

    it('can create a log with linked tags', async () => {
        const title = 'A short title';
        const text = 'Sample Text';
        const tags = ['FOOD', 'GLOBAL'];

        // Return to the creation page
        await goToPage(page, 'log-create');

        // Select the boxes and send the values of the title and text to it
        await page.type('#title', title);
        // eslint-disable-next-line no-undef
        await page.evaluate((text) => model.logs.creationModel.textEditor.setValue(text), text);

        // Expect no TEST-TAG-27 tag to be there, because it is archived, but expect tag TEST-TAG-31
        let testTag27Found = false;
        let testTag31Found = false;
        // Find the selection options corresponding to the tag texts
        const tagOptions = await page.$$('.tag-option');
        for (const option of tagOptions) {
            const optionText = await option.evaluate((element) => element.querySelector('label').innerText);
            if (tags.includes(optionText)) {
                await option.evaluate((element) => element.querySelector('input').click());
                await page.waitForTimeout(100);
            }
            if (optionText === 'TEST-TAG-27') {
                testTag27Found = true;
            }
            if (optionText === 'TEST-TAG-31') {
                testTag31Found = true;
            }
        }

        expect(testTag27Found).to.be.false;
        expect(testTag31Found).to.be.true;

        // Expect to have selected two options
        const tagSelectedOptions = await page.$$('.tag-option input:checked');
        expect(Object.keys(tagSelectedOptions).length).to.equal(2);

        // Create the new log
        const buttonSend = await page.$('button#send');
        await buttonSend.evaluate((button) => button.click());
        await page.waitForTimeout(250);

        // Return the page to home
        await goToPage(page, 'log-overview');

        // Get the latest post and verify that the selected tags correspond to the posted tags
        const table = await page.$$('tr');
        firstRowId = await getFirstRow(table, page);
        const firstRowTags = await page.$(`#${firstRowId}-tags .popover-actual-content`);
        const tagsText = await page.evaluate((element) => element.innerText, firstRowTags);
        expect(tagsText).to.equal(tags.join(', '));
    });

    it('can navigate to tag creation screen', async () => {
        // Return to the creation page
        await goToPage(page, 'log-create');

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
        // Use utf-characters to check that it is well handled, for example for French accents
        const file2 = 'hadron_collider_(é_è).jpg';

        // Return to the creation page
        await goToPage(page, 'log-create');

        // Select the boxes and send the values of the title and text to it
        await page.type('#title', title);
        // eslint-disable-next-line no-undef
        await page.evaluate((text) => model.logs.creationModel.textEditor.setValue(text), text);

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
        await goToPage(page, 'log-overview');

        // Get the latest post and verify the title of the log we posted
        const table = await page.$$('tr');
        firstRowId = await getFirstRow(table, page);
        const firstRowTitle = await page.$(`#${firstRowId}-title .popover-actual-content`);
        const titleText = await page.evaluate((element) => element.innerText, firstRowTitle);
        expect(titleText).to.equal(title);

        // Verify that this log has two attachments, as was submitted
        const firstRowAttachmentsCount = await page.$(`#${firstRowId}-attachments-text`);
        const attachmentsCountText = await page.evaluate((element) => element.innerText, firstRowAttachmentsCount);
        expect(attachmentsCountText).to.equal('2');

        // Go to the log detail page via ahref link
        const buttonId = parseInt(firstRowId.slice('row'.length, firstRowId.length), 10);
        const button = await page.$(`a#btn${buttonId}`);
        await button.evaluate((btn) => btn.click());
        await page.waitForTimeout(1000);
        // Click on "Show all" button
        const showAllButton = await page.$('#toggleCollapse');
        await showAllButton.click();
        await page.waitForTimeout(500);
        // Verify that the attachment names match the ones we uploaded
        const parsedFirstRowId = parseInt(firstRowId.slice('row'.length, firstRowId.length), 10);
        const attachmentsField = await page.$(`#post${parsedFirstRowId}-attachments`);
        const attachmentsText = await page.evaluate((element) => element.innerText, attachmentsField);
        expect(attachmentsText).to.equal(`Attachments:\t\n${file1},\n${file2}`);
    }).timeout(12000);

    it('can clear the file attachment input if at least one is submitted', async () => {
        // Return to the creation page
        await goToPage(page, 'log-create');

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
        await goToPage(page, 'log-create');
        await page.waitForTimeout(100);

        // Select the boxes and send the values of the title and text to it
        await page.type('#title', title);
        // eslint-disable-next-line no-undef
        await page.evaluate((text) => model.logs.creationModel.textEditor.setValue(text), text);

        // Send the value of the run numbers string to the input
        await page.type('#run-number', runNumbersStr);

        // Create the new log
        const buttonSend = await page.$('button#send');
        await buttonSend.evaluate((button) => button.click());
        await page.waitForNavigation();
        await goToPage(page, 'log-overview');
        await page.waitForTimeout(100);

        // Find the created log
        const table = await page.$$('tr');
        firstRowId = await getFirstRow(table, page);

        const firstRowTitle = await page.$(`#${firstRowId}-title .popover-actual-content`);
        const titleText = await page.evaluate((element) => element.innerText, firstRowTitle);
        expect(titleText).to.equal(title);

        // Go to the log detail page
        const rowId = parseInt(firstRowId.replace(/\D/g, ''), 10);
        await goToPage(page, `log-detail&id=${rowId}`);
        await page.waitForTimeout(100);

        // Click on "Show all" button
        const showAllButton = await page.$('#toggleCollapse');
        await showAllButton.click();
        await page.waitForTimeout(200);
        const runsField = await page.$(`#post${rowId}-runs`);

        const runsText = await page.evaluate((element) => element.innerText, runsField);
        expect(runsText).to.equal(`Runs:\t\n${runNumbersStr}`);
    }).timeout(10000);

    it('can create a log with multiple run numbers', async () => {
        const title = 'Multiple run numbers test';
        const text = 'Sample Text';
        const runNumbers = [1, 2];
        const runNumbersStr = runNumbers.join(',');

        // Return to the creation page
        await goToPage(page, 'log-create');

        // Select the boxes and send the values of the title and text to it
        await page.type('#title', title);
        // eslint-disable-next-line no-undef
        await page.evaluate((text) => model.logs.creationModel.textEditor.setValue(text), text);

        // Send the value of the run numbers string to the input
        await page.type('#run-number', runNumbersStr);

        // Wait for the button to not be disabled
        await page.waitForTimeout(50);

        // Create the new log
        const buttonSend = await page.$('button#send');
        await buttonSend.evaluate((button) => button.click());
        await page.waitForNavigation();
        await goToPage(page, 'log-overview');
        await page.waitForFunction('document.querySelector("body").innerText.includes("Multiple run numbers test")');

        // Find the created log
        const table = await page.$$('tr');
        firstRowId = await getFirstRow(table, page);
        const firstRowTitle = await page.$(`#${firstRowId}-title .popover-actual-content`);
        const titleText = await page.evaluate((element) => element.innerText, firstRowTitle);
        expect(titleText).to.equal(title);

        // Go to the log detail page
        const rowId = parseInt(firstRowId.replace(/\D/g, ''), 10);
        await goToPage(page, 'log-detail', { queryParameters: { id: rowId } });

        // Click on "Show all" button
        const showAllButton = await page.$('#toggleCollapse');
        await showAllButton.click();
        await page.waitForTimeout(1000);
        const runsField = await page.$(`#post${rowId}-runs`);
        const runsText = await page.evaluate((element) => element.innerText, runsField);
        for (const runNumber of runNumbers) {
            expect(runsText).to.include(runNumber);
        }
    }).timeout(10000);
};
