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
} = require('../defaults.js');

module.exports = () => {
    let page;
    let browser;

    before(async () => {
        [page, browser] = await defaultBefore();
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

    after(async () => {
        await defaultAfter(page, browser);
    });
};
