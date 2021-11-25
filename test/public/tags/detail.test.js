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
const { defaultBefore, defaultAfter, expectInnerText, pressElement, getFirstRow } = require('../defaults');

const { expect } = chai;

module.exports = () => {
    let page;
    let browser;
    let url;

    let table;
    let firstRowId;

    before(async () => {
        [page, browser, url] = await defaultBefore(page, browser);
    });
    after(async () => {
        [page, browser] = await defaultAfter(page, browser);
    });

    it('tag detail loads correctly', async () => {
        await page.goto(`${url}/?page=tag-detail&id=1&panel=logs`, { waitUntil: 'networkidle0' });
        await expectInnerText(page, 'h2', 'Tag: FOOD');
    });

    it('can navigate to a log detail page', async () => {
        table = await page.$$('tr');
        firstRowId = await getFirstRow(table, page);
        const parsedFirstRowId = parseInt(firstRowId.slice('row'.length, firstRowId.length), 10);

        // We expect the entry page to have the same id as the id from the tag overview
        await pressElement(page, `#${firstRowId}`);
        await page.waitForTimeout(100);
        const redirectedUrl = await page.url();
        expect(String(redirectedUrl).startsWith(`${url}/?page=log-detail&id=${parsedFirstRowId}`)).to.be.true;
    });

    it('notifies if a specified tag id is invalid', async () => {
        // Navigate to a tag detail view with an id that cannot exist
        await page.goto(`${url}/?page=tag-detail&id=abc`, { waitUntil: 'networkidle0' });

        // Because this tag id is invalid, we expect an error message to appear
        await expectInnerText(page, '.alert', 'Invalid Attribute: "params.tagId" must be a number');
    });

    it('notifies if a specified tag id is not found', async () => {
        // Navigate to a tag detail view with an id that cannot exist
        await page.goto(`${url}/?page=tag-detail&id=999`, { waitUntil: 'networkidle0' });

        // Because this tag does not exist, we expect an error message to appear
        await expectInnerText(page, '.alert', 'Tag with this id (999) could not be found');
    });
};
