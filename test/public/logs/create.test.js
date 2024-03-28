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
const { defaultBefore, defaultAfter, goToPage, expectInputValue } = require('../defaults');
const path = require('path');
const { GetAllLogsUseCase } = require('../../../lib/usecases/log/index.js');
const { pressElement, expectInnerText, fillInput, checkMismatchingUrlParam, waitForTimeout, waitForNavigation } = require('../defaults.js');
const fs = require('fs');

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
    const assetsDir = [__dirname, '../..', 'assets'];

    before(async () => {
        [page, browser, url] = await defaultBefore();
        await page.setViewport({
            width: 1920,
            height: 1080,
            deviceScaleFactor: 1,
        });

        /*
         * AliECS need to clone bookkeeping package, and some unicode characters are not allowed in file names
         * So to test specific file names, store files in git under an acceptable name but rename it on the fly before the test and put it
         * back afterward
         */
        try {
            fs.renameSync(path.resolve(...assetsDir, 'hadron_collider_(é_è).jpg'), path.resolve(...assetsDir, 'hadron_collider_`(é_è)’.jpg'));
        } catch (_) {
            // File has probably been renamed in another test
        }
    });

    after(async () => {
        [page, browser] = await defaultAfter(page, browser);

        try {
            fs.renameSync(path.resolve(...assetsDir, 'hadron_collider_`(é_è)’.jpg'), path.resolve(...assetsDir, 'hadron_collider_(é_è).jpg'));
        } catch (_) {
            // File has probably been renamed in another test
        }
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
        await pressElement(page, '#text ~ .CodeMirror');
        await page.keyboard.type(text);

        // Create the new log
        await pressElement(page, '#send:not([disabled])');
        await page.waitForNavigation();

        const lastLog = await getLastLog();
        expect(lastLog.title).to.equal(title);
    });

    it('Should successfully display the log-reply form', async () => {
        await goToPage(page, 'log-reply&parentLogId=1');

        await expectInnerText(page, 'h3', 'Reply to: First entry');

        await pressElement(page, '.log-display-action-buttons button:nth-of-type(2)');
        await expectInnerText(page, '#log-id-1 span[role="presentation"]:first-of-type', 'Power interruption due to unplugged wire.');

        await waitForNavigation(page, () => pressElement(page, '#parent-log-details'));

        expect(await checkMismatchingUrlParam(page, { ['log-details']: '1' }));
    });

    it('Should successfully display the autofilled runs, environments and lhcFills when replying', async () => {
        await goToPage(page, 'log-reply&parentLogId=119');

        await expectInputValue(page, 'input#run-numbers', '2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22');
        await expectInputValue(page, 'input#environments', 'Dxi029djX, eZF99lH6');
        await expectInputValue(page, 'input#lhc-fills', '1, 4, 6');
    });

    it('Should verify that form autofills all inputs with provided full parameters.', async () => {
        await goToPage(page, 'log-create&runNumbers=1,2,3&lhcFillNumbers=1,2,3&environmentIds=1,2,3');

        await expectInputValue(page, 'input#run-numbers', '1,2,3');
        await expectInputValue(page, 'input#environments', '1,2,3');
        await expectInputValue(page, 'input#lhc-fills', '1,2,3');
    });

    it('Should verify that form autofills runNumbers only when leaving other parameters empty.', async () => {
        await goToPage(page, 'log-create&runNumbers=1,2,3');

        await expectInputValue(page, 'input#run-numbers', '1,2,3');
        await expectInputValue(page, 'input#environments', '');
        await expectInputValue(page, 'input#lhc-fills', '');
    });

    it('Should verify that form autofills environmentIds only when leaving other parameters empty.', async () => {
        await goToPage(page, 'log-create&environmentIds=1,2,3');

        await expectInputValue(page, 'input#run-numbers', '');
        await expectInputValue(page, 'input#environments', '1,2,3');
        await expectInputValue(page, 'input#lhc-fills', '');
    });

    it('Should verify that form autofills the lhcFillNumbers only when leaving other parameters empty.', async () => {
        await goToPage(page, 'log-create&lhcFillNumbers=1,2,3');

        await expectInputValue(page, 'input#run-numbers', '');
        await expectInputValue(page, 'input#environments', '');
        await expectInputValue(page, 'input#lhc-fills', '1,2,3');
    });

    it('Should verify that form autofills the runNumbers and environmentIds when leaving lhcFills empty.', async () => {
        await goToPage(page, 'log-create&runNumbers=1,2,3&environmentIds=1,2,3');

        await expectInputValue(page, 'input#run-numbers', '1,2,3');
        await expectInputValue(page, 'input#environments', '1,2,3');
        await expectInputValue(page, 'input#lhc-fills', '');
    });

    it('Should verify that form autofills the runNumbers and lhcFillNumbers when leaving environmentIds empty.', async () => {
        await goToPage(page, 'log-create&runNumbers=1,2,3&lhcFillNumbers=1,2,3');

        await expectInputValue(page, 'input#run-numbers', '1,2,3');
        await expectInputValue(page, 'input#environments', '');
        await expectInputValue(page, 'input#lhc-fills', '1,2,3');
    });

    it('Should verify that form autofills the environmentIds and lhcFillNumbers when leaving runNumbers empty.', async () => {
        await goToPage(page, 'log-create&environmentIds=1,2,3&lhcFillNumbers=1,2,3');

        await expectInputValue(page, 'input#run-numbers', '');
        await expectInputValue(page, 'input#environments', '1,2,3');
        await expectInputValue(page, 'input#lhc-fills', '1,2,3');
    });

    it('can disable submit with invalid data', async () => {
        const invalidTitle = 'A';
        const validTitle = 'A valid title';
        const text = 'Sample Text';

        await goToPage(page, 'log-create');
        // Select the boxes and send the values of the title and text to it
        await fillInput(page, '#title', validTitle);
        await pressElement(page, '#text ~ .CodeMirror');
        await page.keyboard.type(text);

        // Form is valid, button should be enabled
        await page.waitForSelector('#send:not([disabled])', { timeout: 200 });

        // Make the form invalid
        await fillInput(page, '#title', invalidTitle);

        // Create check disabled button
        await page.waitForSelector('#send[disabled]', { timeout: 200 });
    });

    it('can create a log with linked tags', async () => {
        const title = 'A short title';
        const text = 'Sample Text';
        const tags = ['FOOD', 'GLOBAL'];

        // Return to the creation page
        await goToPage(page, 'log-create');

        // Select the boxes and send the values of the title and text to it
        await fillInput(page, '#title', title);
        // eslint-disable-next-line no-undef
        await pressElement(page, '#text ~ .CodeMirror');
        await page.keyboard.type(text);

        // Expect no TEST-TAG-27 tag to be there, because it is archived, but expect tag TEST-TAG-31
        let testTag27Found = false;
        let testTag31Found = false;
        // Find the selection options corresponding to the tag texts
        const tagOptions = await page.$$('.tag-option');
        for (const option of tagOptions) {
            const optionText = await option.evaluate((element) => element.querySelector('label').innerText);
            if (tags.includes(optionText)) {
                // Check the option and get the input's id at the same time
                const inputId = await option.evaluate((element) => {
                    // Click the option
                    const input = element.querySelector('input');
                    input.click();
                    return input.id;
                });
                await page.waitForSelector(`#${inputId}:checked`, { timeout: 200 });
            }
            if (optionText === 'TEST-TAG-27') {
                testTag27Found = true;
                // Fail early
                break;
            }

            if (optionText === 'TEST-TAG-31') {
                testTag31Found = true;
            }
        }

        expect(testTag27Found).to.be.false;
        expect(testTag31Found).to.be.true;

        // Expect to have selected two options
        const tagSelectedOptions = await page.$$('.tag-option input:checked');
        expect(tagSelectedOptions).to.lengthOf(2);

        // Create the new log
        await pressElement(page, '#send:not([disabled])');
        await page.waitForNavigation();

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
        await waitForTimeout(500);
        const redirectedUrl = await page.url();
        expect(redirectedUrl).to.equal(`${url}/?page=tag-create`);
    });

    it('can create a log with file attachments', async () => {
        const title = 'Shorter';
        const text = 'Sample Text';
        const file1 = '1200px-CERN_logo.png';
        // Use utf-characters to check that it is well handled, for example for French accents
        const file2 = 'hadron_collider_`(é_è)’.jpg';

        // Return to the creation page
        await goToPage(page, 'log-create');

        // Select the boxes and send the values of the title and text to it
        await page.type('#title', title);
        // eslint-disable-next-line no-undef
        await pressElement(page, '#text ~ .CodeMirror');
        await page.keyboard.type(text);

        // Add both the file attachments to the input field
        const attachmentsInput = await page.$('#attachments');
        const file1Path = path.resolve(...assetsDir, file1);
        const file2Path = path.resolve(...assetsDir, file2);
        attachmentsInput.uploadFile(file1Path, file2Path);
        await waitForTimeout(500);

        // Ensure that both file attachments were received
        const attachmentNames = await page.$('#attachments-list');
        const attachmentNamesText = await page.evaluate((element) => element.innerText, attachmentNames);
        expect(attachmentNamesText).to.equal(`${file1}\n,\n${file2}`);

        // Create the new log
        await pressElement(page, '#send:not([disabled])');
        await page.waitForNavigation();

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
        attachmentsInput.uploadFile(path.resolve(...assetsDir, '1200px-CERN_logo.png'));
        await waitForTimeout(500);

        // We expect the clear button to appear
        clearButton = await page.$('#clearAttachments');
        expect(Boolean(clearButton)).to.be.true;

        // We expect that clicking the clear button resets the attachment input
        const uploadedAttachments = await page.evaluate((element) => element.value, attachmentsInput);
        expect(uploadedAttachments.endsWith('1200px-CERN_logo.png')).to.be.true;

        await clearButton.evaluate((clearButton) => clearButton.click());
        await waitForTimeout(100);
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
        await pressElement(page, '#text ~ .CodeMirror');
        await page.keyboard.type(text);

        // Send the value of the run numbers string to the input
        await page.type('#run-numbers', runNumbersStr);

        // Create the new log
        await pressElement(page, '#send:not([disabled])');
        await page.waitForNavigation();

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
        await pressElement(page, '#text ~ .CodeMirror');
        await page.keyboard.type(text);

        // Send the value of the run numbers string to the input
        await page.type('#run-numbers', runNumbersStr);

        // Wait for the button to not be disabled
        await waitForTimeout(50);

        // Create the new log
        await pressElement(page, '#send:not([disabled])');
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
        await pressElement(page, '#text ~ .CodeMirror');
        await page.keyboard.type(text);

        // Send the value of the environments string to the input
        await page.type('#environments', environmentsStr);

        // Create the new log
        await pressElement(page, '#send:not([disabled])');
        await page.waitForNavigation();

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
        await pressElement(page, '#text ~ .CodeMirror');
        await page.keyboard.type(text);

        // Send the value of the environments string to the input
        await page.type('#environments', environmentsStr);

        // Wait for the button to not be disabled
        await waitForTimeout(50);

        // Create the new log
        await pressElement(page, '#send:not([disabled])');
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
        await pressElement(page, '#text ~ .CodeMirror');
        await page.keyboard.type(text);

        // Send the value of the run numbers string to the input
        await page.type('#lhc-fills', lhcFillNumbersStr);

        // Wait for the button to not be disabled
        await waitForTimeout(50);

        // Create the new log
        await pressElement(page, '#send:not([disabled])');
        await page.waitForNavigation();

        const lastLog = await getLastLog();
        expect(lastLog.title).to.equal(title);
        expect(lastLog.lhcFills.map(({ fillNumber }) => fillNumber)).to.eql(lhcFillNumbers);
    });

    it('should successfully switch to on-call log template', async () => {
        await goToPage(page, 'log-create');

        // Log template is the first select of the page
        await page.waitForSelector('select');
        await page.select('select', 'on-call');

        // Expect the inputs to be there
        await page.waitForSelector('#shortDescription', { timeout: 500 });

        const shortDescription = 'Short description of the issue';
        await fillInput(page, '#shortDescription', shortDescription);

        const detectorOrSubsystem = 'DCS';
        await page.select('#detectorOrSubsystem', detectorOrSubsystem);

        const severity = 'Severe';
        await page.select('#severity', severity);

        const issueScope = 'System commissioning';
        await page.select('#issueScope', issueScope);

        const shifterPosition = 'ECS';
        await page.select('#shifterPosition', shifterPosition);

        const beamMode = 'INJECTION PHYSICS BEAM';
        await page.select(page, '#lhcBeamMode', beamMode);

        const description = 'Description\nof the issue';
        await pressElement(page, '#issue-description ~ .CodeMirror');
        await page.keyboard.type(description);

        const reason = 'Reason\nto call on-call';
        await pressElement(page, '#reason-to-call-on-call ~ .CodeMirror');
        await page.keyboard.type(reason);

        const actions = 'Actions\nalready taken';
        await pressElement(page, '#actions-already-taken ~ .CodeMirror');
        await page.keyboard.type(actions);

        await pressElement(page, '#send:not([disabled])');

        await page.waitForNavigation();
        await expectInnerText(page, 'h2', `${shortDescription} - Call on-call for ${detectorOrSubsystem}`);

        const lastLog = await getLastLog();
        expect(lastLog.title).to.equal(`${shortDescription} - Call on-call for ${detectorOrSubsystem}`);
        // Sometimes, browser adds \r to the request to comply with text form data encoding
        expect(lastLog.text.replaceAll('\r', '')).to.equal(`\
## Importance
${severity} for ${issueScope}

## Shifter
Anonymous - ${shifterPosition}

## LHC beam mode
${beamMode}

## Description
${description}

## Reason to call this on-call
${reason}

## Actions already taken
${actions}\
`);
        const tags = lastLog.tags.map(({ text }) => text);
        expect(tags).to.lengthOf(3);
        expect(tags).to.have.members(['oncall', `${shifterPosition} Shifter`, detectorOrSubsystem]);
    });
};
