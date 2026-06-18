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

const { expect } = require('chai');
const {
    defaultBefore,
    defaultAfter,
    getInnerText,
    pressElement,
    goToPage,
} = require('../defaults.js');

module.exports = () => {
    let page;
    let browser;
    let url;
    let context;

    before(async () => {
        [page, browser, url] = await defaultBefore(page, browser);
        context = browser.defaultBrowserContext();
        context.overridePermissions(url, ['clipboard-read', 'clipboard-write', 'clipboard-sanitized-write']);
    });

    it('Should show warning when a filter in the url is not recognised', async () => {
        await page.goto('http://localhost:4000/?page=log-overview&filter[fake]=fake', { waitUntil: 'load' });
        const warningText = await getInnerText(await page.waitForSelector('.alert-warning > ul'));

        expect(warningText).to.equal('Unknown Filters:\nThe filters: [\'fake\']; are not reccognised. Check if they are spelled correctly.');
    });

    it('Should remove warnings entry after clicking the x icon', async () => {
        await pressElement(page, '.alert-warning .btn', true);
        const warning = await page.$('.alert-warning');

        expect(warning).to.be.null;
    });

    it('Should show warning when a url filter cannot be parsed/normalized', async () => {
        await page.goto('http://localhost:4000/?page=run-overview&filter[detectors][operator]=or&filter[detecttors][values]=CTP&filter[tagss][values]=CPV&filter[tags][operation]=or', { waitUntil: 'load' });
        const unparsableWarningText = await getInnerText(await page.waitForSelector('.alert-warning > ul > li:nth-of-type(1)'));
        const unknownFilterWarningText = await getInnerText(await page.waitForSelector('.alert-warning > ul > li:nth-of-type(2)'));

        // The tags and detectors filters will fail if it has no value.
        // However, if the url also contains its operator, it will still attempt to set the filters, which would fail, hence the warning
        expect(unparsableWarningText).to.equal('Unparsable Filters:\nThe following filter-value pairs could not be parsed: [detectors[operator]=or, tags[operation]=or]');
        expect(unknownFilterWarningText).to.equal('Unknown Filters:\nThe filters: [\'detecttors\', \'tagss\']; are not reccognised. Check if they are spelled correctly.');
    });

    it('Should show warning if an unparsable filter url is pasted', async () => {
        const url = 'unparsable url';
        await goToPage(page, 'log-overview');

        await page.evaluate(async (url) => await navigator.clipboard.writeText(url), url);
        await pressElement(page, '.dropdown #paste-filters', true);

        const warningText = await getInnerText(await page.waitForSelector('.alert-warning > ul'));
        expect(warningText).to.equal('Unparseable URL:\nURL could not be parsed. URL: unparsable url');
    });
    
    it('Should show warning if filter url is pasted on the wong page', async () => {
        const url = 'http://localhost:4000/?page=lhc-period-overview&filter[names][]=name';
        await goToPage(page, 'log-overview');

        await page.evaluate(async (url) => await navigator.clipboard.writeText(url), url);
        await pressElement(page, '.dropdown #paste-filters', true);

        const warningText = await getInnerText(await page.waitForSelector('.alert-warning > ul'));
        expect(warningText).to.equal('Page-Filter mismatch:\nThe filters provided were meant for lhc-period-overview');
    });
    
    after(async () => {
        await defaultAfter(page, browser);
    });
};
