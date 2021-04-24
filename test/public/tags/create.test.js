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

const { defaultBefore, defaultAfter, expectInnerText, pressElement, goToPage } = require('../defaults');

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

    it('can create a tag', async () => {
        const text = 'EXAMPLE';
        await page.goto(`${url}/?page=tag-create`, { waitUntil: 'networkidle0' });

        // Enter the text value
        await page.waitForSelector('#text');
        await page.type('#text', text);

        // Create the new tag
        await pressElement(page, 'button#send');

        // Verify the title of the page
        await expectInnerText(page, '.mv2', `Tag: ${text}`);

        // Return the page to the tag overview
        await page.goto(`${url}/?page=tag-overview`, { waitUntil: 'networkidle0' });
    });

    it('shows an error message if tag creation failed', async () => {
        const text = 'EXAMPLE';

        // Go to the tag creation page
        await goToPage(page, 'tag-create');

        // Enter the duplicate text value
        await page.waitForSelector('#text');
        await page.type('#text', text);

        // Create the new tag
        await pressElement(page, 'button#send');

        // Because this tag already exists, we expect an error message to appear
        await expectInnerText(page, '.alert', 'Conflict: The provided entity already exists');
    });
};
