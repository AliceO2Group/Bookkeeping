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
const { defaultBefore, defaultAfter, pressElement, takeScreenshot, expectInputValue } = require('../defaults.js');

module.exports = () => {
    let page;
    let browser;
    let context;
    let url;

    before(async () => {
        [page, browser, url] = await defaultBefore(page, browser);
        context = browser.defaultBrowserContext();
        context.overridePermissions(url, ['clipboard-read', 'clipboard-write', 'clipboard-sanitized-write']);
    });

    it('Should copy url when clicking filer copy button', async () => {
        const url = 'http://localhost:4000/?page=lhc-period-overview&filter[names][]=name&filter[years][]=100&filter[pdpBeamTypes][]=PbPb';
        await page.goto(url, { waitUntil: 'load' });
        await takeScreenshot(page, 'test');
        await pressElement(page, '#copy-filters', true);

        const clipboardContents = await page.evaluate(async () => decodeURI(await navigator.clipboard.readText()));
        expect(clipboardContents).to.equal(url);
    });

    it('Should set filters when pressing paste active filters button', async () => {
        const url = 'http://localhost:4000/?page=lhc-period-overview&filter[names][]=name&filter[years][]=100&filter[pdpBeamTypes][]=PbPb';

        await page.evaluate(async (url) => await navigator.clipboard.writeText(url), url);
        await pressElement(page, '#paste-filters', true);

        const actualUrl = page.url();
        expect(actualUrl).to.equal(url);

        await expectInputValue(page, 'div.flex-row.items-baseline:nth-of-type(1) input[type=text]', 'name');
        await expectInputValue(page, 'div.flex-row.items-baseline:nth-of-type(2) input[type=text]', '100');
        await expectInputValue(page, 'div.flex-row.items-baseline:nth-of-type(3) input[type=text]', 'PbPb');
    });

    it('Should reset filters when pressing the reset all filters button', async () => {
        const url = 'http://localhost:4000/?page=lhc-period-overview&filter[names][]=name&filter[years][]=100&filter[pdpBeamTypes][]=PbPb';

        await page.goto(url, { waitUntil: 'load' });

        await pressElement(page, '.dropdown #reset-filters', true);
        const actualUrl = page.url();
        expect(actualUrl).to.equal('http://localhost:4000/?page=lhc-period-overview');

        await expectInputValue(page, '.name-filter input', '');
        await expectInputValue(page, '.year-filter input', '');
        await expectInputValue(page, '.pdpBeamTypes-filter input', '');
    });

    after(async () => {
        await defaultAfter(page, browser);
    });
};
