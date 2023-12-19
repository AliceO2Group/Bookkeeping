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
const { defaultBefore, defaultAfter, goToPage } = require('../defaults');
const path = require('path');
const { GetAllLogsUseCase } = require('../../../lib/usecases/log/index.js');
const { pressElement, expectInnerText } = require('../defaults.js');

const { expect } = chai;

/**
 * Return the most recent log
 *
 * @return {Promise<Log>} the last log
 */
const getLastLog = async () => {
    const { logs: [lastLog] } = await new GetAllLogsUseCase().execute({ body: {}, params: {}, query: { page: { limit: 1, offset: 0 } } });
    return lastLog;
};

module.exports = () => {
    let page;
    let browser;
    let url;

    before(async () => {
        [page, browser, url] = await defaultBefore();
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
        const header = await page.$('.f3');
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

        const lastLog = await getLastLog();
        expect(lastLog.title).to.equal(title);
    });

    it('Should successfully display the log-reply form', async () => {
        await goToPage(page, 'log-create&parentLogId=1');

        const header = await page.$eval('.f3', (element) => element.textContent);
        expect(header).to.equal('Reply to: First entry');

        await pressElement(page, '#show-collapse-1');
        await page.waitForTimeout(20);

        await expectInnerText(page, 'span[role="presentation"]:first-of-type', 'Power interruption due to unplugged wire.');

        await pressElement(page, '#details-of-1');
        await page.waitForTimeout(20);

        expect(new URL(page.url()).search).to.equal('?page=log-detail&id=1');
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
        const lastLog = await getLastLog();
        expect(lastLog.tags.map(({ text }) => text)).to.eql(tags);
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
        expect(attachmentNamesText).to.equal(`${file1},\n\n${file2}`);

        // Create the new log
        const buttonSend = await page.$('button#send');
        await buttonSend.evaluate((button) => button.click());
        // Sizable delay to allow for file uploading
        await page.waitForTimeout(2500);

        // Return the page to home
        const lastLog = await getLastLog();

        expect(lastLog.title).to.equal(title);
        expect(lastLog.attachments).to.lengthOf(2);
        expect(lastLog.attachments[0].originalName).to.equal(file1);
        expect(lastLog.attachments[1].originalName).to.equal(file2);
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

        // Select the boxes and send the values of the title and text to it
        await page.type('#title', title);
        // eslint-disable-next-line no-undef
        await page.evaluate((text) => model.logs.creationModel.textEditor.setValue(text), text);

        // Send the value of the run numbers string to the input
        await page.type('#run-number', runNumbersStr);

        // Create the new log
        const buttonSend = await page.$('button#send');
        await buttonSend.evaluate((button) => button.click());
        await page.waitForNavigation({ waitUntil: 'networkidle0' });

        const lastLog = await getLastLog();
        expect(lastLog.title).to.equal(title);
        expect(lastLog.runs).to.lengthOf(1);
        expect(`${lastLog.runs[0].runNumber}`).to.eql(runNumbersStr);
    });

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

        const lastLog = await getLastLog();
        expect(lastLog.title).to.equal(title);
        expect(lastLog.runs.map(({ runNumber }) => runNumber)).to.eql(runNumbers);
    });

    it('can create a log with an environment', async () => {
        const title = 'Single environment test';
        const text = 'Sample Text';
        const environmentsStr = '8E4aZTjY';

        // Return to the creation page
        await goToPage(page, 'log-create');

        // Select the boxes and send the values of the title and text to it
        await page.type('#title', title);
        // eslint-disable-next-line no-undef
        await page.evaluate((text) => model.logs.creationModel.textEditor.setValue(text), text);

        // Send the value of the environments string to the input
        await page.type('#environments', environmentsStr);

        // Create the new log
        const buttonSend = await page.$('button#send');
        await buttonSend.evaluate((button) => button.click());
        await page.waitForNavigation({ waitUntil: 'networkidle0' });

        const lastLog = await getLastLog();
        expect(lastLog.title).to.equal(title);
    });

    it('can create a log with multiple environments', async () => {
        const title = 'Multiple environments test';
        const text = 'Sample Text';
        const environments = ['8E4aZTjY', 'GIDO1jdkD'];
        const environmentsStr = environments.join(',');

        // Return to the creation page
        await goToPage(page, 'log-create');

        // Select the boxes and send the values of the title and text to it
        await page.type('#title', title);
        // eslint-disable-next-line no-undef
        await page.evaluate((text) => model.logs.creationModel.textEditor.setValue(text), text);

        // Send the value of the environments string to the input
        await page.type('#environments', environmentsStr);

        // Wait for the button to not be disabled
        await page.waitForTimeout(50);

        // Create the new log
        const buttonSend = await page.$('button#send');
        await buttonSend.evaluate((button) => button.click());
        await page.waitForNavigation();

        const lastLog = await getLastLog();
        expect(lastLog.title).to.equal(title);
    });

    it('can create a log with multiple LHC fill numbers', async () => {
        const title = 'Multiple lhc numbers test';
        const text = 'Sample Text';
        const lhcFillNumbers = [1, 2];
        const lhcFillNumbersStr = lhcFillNumbers.join(',');

        // Return to the creation page
        await goToPage(page, 'log-create');

        // Select the boxes and send the values of the title and text to it
        await page.type('#title', title);
        // eslint-disable-next-line no-undef
        await page.evaluate((text) => model.logs.creationModel.textEditor.setValue(text), text);

        // Send the value of the run numbers string to the input
        await page.type('#lhc-fills', lhcFillNumbersStr);

        // Wait for the button to not be disabled
        await page.waitForTimeout(50);

        // Create the new log
        const buttonSend = await page.$('button#send');
        await buttonSend.evaluate((button) => button.click());
        await page.waitForNavigation();

        const lastLog = await getLastLog();
        expect(lastLog.title).to.equal(title);
        expect(lastLog.lhcFills.map(({ fillNumber }) => fillNumber)).to.eql(lhcFillNumbers);
    });
};
