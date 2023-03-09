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
const { defaultBefore, defaultAfter, expectInnerText, pressElement, getFirstRow, goToPage } = require('../defaults');

const { expect } = chai;

module.exports = () => {
    let page;
    let browser;

    let table;
    let firstRowId;

    before(async () => {
        [page, browser] = await defaultBefore(page, browser);
    });
    after(async () => {
        [page, browser] = await defaultAfter(page, browser);
    });

    it('tag detail loads correctly', async () => {
        await goToPage(page, 'tag-detail', { queryParameters: { id: 1, panel: 'logs' } });
        await expectInnerText(page, 'h2', 'Tag: FOOD');
    });

    it('can navigate to a log detail page', async () => {
        table = await page.$$('tr');
        firstRowId = await getFirstRow(table, page);
        const parsedFirstRowId = parseInt(firstRowId.slice('row'.length, firstRowId.length), 10);

        // We expect the entry page to have the same id as the id from the tag overview
        await pressElement(page, `#${firstRowId} .btn-redirect`, true);
        await page.waitForTimeout(100);

        const [, parametersExpr] = await page.url().split('?');
        const urlParameters = parametersExpr.split('&');
        expect(urlParameters).to.contain('page=log-detail');
        expect(urlParameters).to.contain(`id=${parsedFirstRowId}`);
    });

    it('should successfully display tag\'s related emails', async () => {
        await goToPage(page, 'tag-detail', { queryParameters: { id: 1, panel: 'logs' } });
        const emails = await page.$$('#tag-email a');
        expect(emails).to.lengthOf(1);
        expect(await emails[0].evaluate((element) => element.href)).to.equal('mailto:food-group@cern.ch');
        expect(await emails[0].evaluate((element) => element.innerText)).to.equal('food-group@cern.ch');
    });

    it('notifies if a specified tag id is invalid', async () => {
        // Navigate to a tag detail view with an id that cannot exist
        await goToPage(page, 'tag-detail', { queryParameters: { id: 'abc' } });

        // Because this tag id is invalid, we expect an error message to appear
        await expectInnerText(page, '.alert', 'Invalid Attribute: "params.tagId" must be a number');
    });

    it('notifies if a specified tag id is not found', async () => {
        // Navigate to a tag detail view with an id that cannot exist
        await goToPage(page, 'tag-detail', { queryParameters: { id: 999 } });

        // Because this tag does not exist, we expect an error message to appear
        await expectInnerText(page, '.alert', 'Tag with this id (999) could not be found');
    });

    // Skipped because for now frontend send requests that are not authenticated as admin, hence this can't work
    it.skip('can update a tag', async () => {
        await goToPage(page, 'tag-detail', { queryParameters: { id: 23, panel: 'logs' } });
        await pressElement(page, '#edit-tag');
        await pressElement(page, '#tag-archive-toggle');
        await pressElement(page, '#confirm-tag-edit');

        await page.waitForNetworkIdle(50);
        expect(await page.$eval('h2', (title) => title.parentNode.innerText.includes('Archived'))).to.be.true;

        // Do the same again to un-archive
        await pressElement(page, '#edit-tag');
        await pressElement(page, '#tag-archive-toggle');
        await pressElement(page, '#confirm-tag-edit');

        await page.waitForNetworkIdle(50);
        expect(await page.$eval('h2', (title) => title.parentNode.innerText.includes('Archived'))).to.be.false;
    });
};
