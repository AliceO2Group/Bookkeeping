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
    let url;

    let table;
    let firstRowId;

    before(async () => {
        [page, browser, url] = await defaultBefore(page, browser);
    });
    after(async () => {
        [page, browser] = await defaultAfter(page, browser);
    });

    it('subsystem detail loads correctly', async () => {
        await goToPage(page, 'subsystem-detail', { queryParameters: { id: 1 } });
        await expectInnerText(page, 'h2', 'Subsystem: Subsystem Plant #1');
    });

    it('can navigate to the log panel', async () => {
        await pressElement(page, '#logs-tab');
        await page.waitForTimeout(100);
        const redirectedUrl = await page.url();
        expect(String(redirectedUrl).startsWith(`${url}/?page=subsystem-detail&id=1&panel=logs`)).to.be.true;
    });

    it('can navigate to the main panel', async () => {
        await pressElement(page, '#main-tab');
        await page.waitForTimeout(100);
        const redirectedUrl = await page.url();
        expect(String(redirectedUrl).startsWith(`${url}/?page=subsystem-detail&id=1&panel=main`)).to.be.true;
    });

    it('can navigate to the log panel', async () => {
        await pressElement(page, '#logs-tab');
        await page.waitForTimeout(100);
        const redirectedUrl = await page.url();
        expect(String(redirectedUrl).startsWith(`${url}/?page=subsystem-detail&id=1&panel=logs`)).to.be.true;
    });

    it('can navigate to a log detail page', async () => {
        table = await page.$$('tr');
        firstRowId = await getFirstRow(table, page);

        // We expect the entry page to have the same id as the id from the subsystem overview
        await pressElement(page, `#${firstRowId}`);
        await page.waitForTimeout(100);
        const redirectedUrl = await page.url();
        expect(String(redirectedUrl).startsWith(`${url}/?page=log-detail&id=3`)).to.be.true;
    });

    it('notifies if a specified subsystem id is invalid', async () => {
        // Navigate to a subsystem detail view with an id that cannot exist
        await goToPage(page, 'subsystem-detail', { queryParameters: { id: 'abc' } });

        // We expect there to be an error message
        await expectInnerText(page, '.alert', 'Invalid Attribute: "params.subsystemId" must be a number');
    });

    it('notifies if a specified subsystem id is not found', async () => {
        // Navigate to a subsystem detail view with an id that cannot exist
        await goToPage(page, 'subsystem-detail', { queryParameters: { id: 999 } });

        // We expect there to be an error message
        await expectInnerText(page, '.alert', 'Subsystem with this id (999) could not be found:');
    });
};
