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

const { readFile, unlink } = require('node:fs/promises');
const { join } = require('node:path');
const { expect } = require('chai');
const { resetDatabaseContent } = require('../../utilities/resetDatabaseContent.js');
const {
    defaultAfter,
    defaultBefore,
    expectInnerText,
    getPopoverSelector,
    goToPage,
    pressElement,
    waitForDownload,
} = require('../defaults.js');

const FROM = '2026-11-16T00:00';
const TO = '2026-11-23T00:00';
// Geneva is one hour ahead of UTC in November
const GENEVA_OFFSET = '+01:00';
const WEEK = 7 * 24 * 60 * 60 * 1000;
const PERIOD_TRIGGER = '#presentation-period .popover-trigger';
const GENERATE_BUTTON = '#generate-presentation';
const GENERATION_STATUS = '#presentation-generation-status';
const DOWNLOAD_LINK = '#download-presentation';
const PDF = '%PDF-1.4\n%%EOF\n';
const FILENAME = 'weekly-report-test.pdf';

const isGenerationRequest = (request) => new URL(request.url()).pathname === '/api/presentations' && request.method() === 'POST';

module.exports = () => {
    let page;
    let browser;

    before(async () => {
        await resetDatabaseContent();
        [page, browser] = await defaultBefore();
        await page.setViewport({ width: 1280, height: 800 });
        // The period is in Geneva time whatever the time zone of the browser, so the browser gets another one
        await page.emulateTimezone('America/New_York');
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            if (!isGenerationRequest(request)) {
                return request.continue();
            }
        });
    });

    after(async () => {
        await defaultAfter(page, browser);
    });

    const preparePresentation = async (from = FROM, to = TO) => {
        await goToPage(page, 'presentations');
        await page.waitForSelector('#presentation-template option[value="1"]');
        await page.select('#presentation-template', '1');
        const popoverSelector = await getPopoverSelector(await page.$(PERIOD_TRIGGER));
        const inputs = `${popoverSelector} input[type="datetime-local"]`;
        await pressElement(page, PERIOD_TRIGGER);
        await page.waitForSelector(inputs, { visible: true });
        await page.$$eval(inputs, ([fromInput, toInput], from, to) => {
            fromInput.value = from;
            fromInput.dispatchEvent(new Event('change', { bubbles: true }));
            toInput.value = to;
            toInput.dispatchEvent(new Event('change', { bubbles: true }));
        }, from, to);
        await pressElement(page, PERIOD_TRIGGER);
        await page.waitForSelector(`${GENERATE_BUTTON}:enabled`);
    };

    const startGeneration = async () => {
        const [request] = await Promise.all([
            page.waitForRequest(isGenerationRequest),
            pressElement(page, GENERATE_BUTTON),
        ]);
        return request;
    };

    it('opens from navigation and lists the existing templates', async () => {
        await goToPage(page, 'home');
        await pressElement(page, '#presentations');
        await expectInnerText(page, '#presentations-page h1', 'Presentations');
        await page.waitForSelector('#presentation-template option[value="1"]');
        const templates = await page.$$eval('#presentation-template option', (options) => options.map(({ text }) => text));
        expect(templates).to.eql(['Choose a template', 'LHC Fill Summary', 'Run Manager Weekly Report']);
        await page.waitForSelector(`${GENERATE_BUTTON}:disabled`);
    });

    it('keeps the create button fully visible with the Presentations tab on a laptop', async () => {
        await goToPage(page, 'presentations');
        await page.waitForSelector('#presentations.selected');
        await page.waitForFunction(() => Array.from(document.querySelectorAll('.navbar-links a')).some(({ textContent }) => textContent === 'ALI FLP'));
        const isWithinViewport = await page.$eval('#create-menu-button', (button) => button.getBoundingClientRect().right <= window.innerWidth);
        expect(isWithinViewport).to.be.true;
    });

    it('shows a spinner until the selected template and period are available as a download', async () => {
        await preparePresentation();
        const request = await startGeneration();
        await expectInnerText(page, `${GENERATION_STATUS} p`, 'Generating the presentation…');
        await page.waitForSelector(`${GENERATION_STATUS} .atom-spinner`);
        await page.waitForSelector(`${GENERATE_BUTTON}:disabled`);
        expect(JSON.parse(await request.fetchPostData())).to.eql({
            templateId: 1,
            from: Date.parse(`${FROM}${GENEVA_OFFSET}`),
            to: Date.parse(`${TO}${GENEVA_OFFSET}`),
        });

        await request.respond({
            status: 200,
            contentType: 'application/pdf',
            headers: { 'Content-Disposition': `attachment; filename="${FILENAME}"` },
            body: PDF,
        });
        await page.waitForSelector(GENERATION_STATUS, { hidden: true });
        await expectInnerText(page, DOWNLOAD_LINK, 'Download PDF');
        const downloadDirectory = await waitForDownload(page, () => pressElement(page, DOWNLOAD_LINK));
        const file = join(downloadDirectory, FILENAME);
        try {
            expect(await readFile(file, 'utf8')).to.equal(PDF);
        } finally {
            await unlink(file);
        }
    });

    it('says that the period is in Geneva time', async () => {
        await goToPage(page, 'presentations');
        await expectInnerText(page, '#presentation-period-time-zone', '(Geneva time)');
    });

    it('requests a predefined week from Monday to Monday in Geneva time', async () => {
        await goToPage(page, 'presentations');
        await page.waitForSelector('#presentation-template option[value="1"]');
        await page.select('#presentation-template', '1');
        const popoverSelector = await getPopoverSelector(await page.$(PERIOD_TRIGGER));
        const weekInput = `${popoverSelector} input[type="number"]`;
        await pressElement(page, PERIOD_TRIGGER);
        await page.waitForSelector(weekInput, { visible: true });
        // Week 47 is in November in every year, when the clocks do not change
        await page.$eval(weekInput, (input) => {
            input.value = '47';
            input.dispatchEvent(new Event('change', { bubbles: true }));
        });
        await pressElement(page, PERIOD_TRIGGER);
        await page.waitForSelector(`${GENERATE_BUTTON}:enabled`);

        const request = await startGeneration();
        const { from, to } = JSON.parse(await request.fetchPostData());
        const genevaClock = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Europe/Zurich',
            weekday: 'long',
            hour: '2-digit',
            minute: '2-digit',
            hourCycle: 'h23',
        });
        expect(genevaClock.format(new Date(from))).to.equal('Monday 00:00');
        expect(to - from).to.equal(WEEK);
        await request.respond({ status: 503, contentType: 'application/json', body: JSON.stringify({ errors: [] }) });
        await page.waitForSelector(`${GENERATE_BUTTON}:enabled`);
    });

    it('discards a finished presentation when another template is chosen', async () => {
        await preparePresentation();
        const request = await startGeneration();
        await request.respond({
            status: 200,
            contentType: 'application/pdf',
            headers: { 'Content-Disposition': `attachment; filename="${FILENAME}"` },
            body: PDF,
        });
        await page.waitForSelector(DOWNLOAD_LINK);

        await page.select('#presentation-template', '2');
        await page.waitForSelector(DOWNLOAD_LINK, { hidden: true });
        await page.waitForSelector(`${GENERATE_BUTTON}:enabled`);
    });

    it('shows the reason generation failed and lets the user retry', async () => {
        await preparePresentation();
        const request = await startGeneration();
        const detail = 'A presentation is already being made. Try again shortly.';
        await request.respond({
            status: 503,
            contentType: 'application/json',
            body: JSON.stringify({ errors: [{ status: 503, title: 'Generation busy', detail }] }),
        });

        await expectInnerText(page, '#presentation-generation-error .alert', `Generation busy: ${detail}`);
        await page.waitForSelector(GENERATION_STATUS, { hidden: true });
        await page.waitForSelector(DOWNLOAD_LINK, { hidden: true });
        await page.waitForSelector(`${GENERATE_BUTTON}:enabled`);
    });

    it('keeps the period when the week of the period picker is emptied', async () => {
        await preparePresentation();
        const first = await startGeneration();
        const period = JSON.parse(await first.fetchPostData());
        await first.respond({ status: 503, contentType: 'application/json', body: JSON.stringify({ errors: [] }) });
        await page.waitForSelector(`${GENERATE_BUTTON}:enabled`);

        const popoverSelector = await getPopoverSelector(await page.$(PERIOD_TRIGGER));
        const weekInput = `${popoverSelector} input[type="number"]`;
        await pressElement(page, PERIOD_TRIGGER);
        await page.waitForSelector(weekInput, { visible: true });
        await page.$eval(weekInput, (input) => {
            input.value = '';
            input.dispatchEvent(new Event('change', { bubbles: true }));
        });
        await pressElement(page, PERIOD_TRIGGER);

        const second = await startGeneration();
        expect(JSON.parse(await second.fetchPostData())).to.deep.equal(period);
        await second.respond({ status: 503, contentType: 'application/json', body: JSON.stringify({ errors: [] }) });
        await page.waitForSelector(`${GENERATE_BUTTON}:enabled`);
    });
    for (const [direction, zone, from, to, expected] of [
        ['forward', 'Pacific/Auckland', '2026-03-29T01:30', '2026-03-30T00:00', { from: Date.UTC(2026, 2, 29, 0, 30), to: Date.UTC(2026, 2, 29, 22) }],
        ['back', 'America/New_York', '2026-10-25T01:30', '2026-10-26T00:00', { from: Date.UTC(2026, 9, 24, 23, 30), to: Date.UTC(2026, 9, 25, 23) }],
    ]) {
        it(`requests the period in Geneva time on the day the clocks go ${direction}, with a browser in ${zone}`, async () => {
            await page.emulateTimezone(zone);
            try {
                await preparePresentation(from, to);
                const request = await startGeneration();
                expect(JSON.parse(await request.fetchPostData())).to.include(expected);
                await request.respond({ status: 503, contentType: 'application/json', body: JSON.stringify({ errors: [] }) });
                await page.waitForSelector(`${GENERATE_BUTTON}:enabled`);
            } finally {
                await page.emulateTimezone('America/New_York');
            }
        });
    }

    it('discards a finished presentation when another period is chosen', async () => {
        await preparePresentation();
        const request = await startGeneration();
        await request.respond({
            status: 200,
            contentType: 'application/pdf',
            headers: { 'Content-Disposition': `attachment; filename="${FILENAME}"` },
            body: PDF,
        });
        await page.waitForSelector(DOWNLOAD_LINK);

        const popoverSelector = await getPopoverSelector(await page.$(PERIOD_TRIGGER));
        const fromInput = `${popoverSelector} input[type="datetime-local"]`;
        await pressElement(page, PERIOD_TRIGGER);
        await page.waitForSelector(fromInput, { visible: true });
        await page.$eval(fromInput, (input) => {
            input.value = '2026-11-17T00:00';
            input.dispatchEvent(new Event('change', { bubbles: true }));
        });
        await page.waitForSelector(DOWNLOAD_LINK, { hidden: true });
        await pressElement(page, PERIOD_TRIGGER);
        await page.waitForSelector(`${GENERATE_BUTTON}:enabled`);
    });

    it('discards the reason generation failed when another template is chosen', async () => {
        await preparePresentation();
        const request = await startGeneration();
        await request.respond({
            status: 503,
            contentType: 'application/json',
            body: JSON.stringify({ errors: [{ status: 503, title: 'Generation busy', detail: 'Try again shortly.' }] }),
        });
        await page.waitForSelector('#presentation-generation-error');

        await page.select('#presentation-template', '2');
        await page.waitForSelector('#presentation-generation-error', { hidden: true });
    });
};
