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

const {
    defaultBefore,
    defaultAfter,
    goToPage,
    fillInput,
    waitForTableLength,
} = require('../defaults.js');

module.exports = () => {
    let page;
    let browser;

    before(async () => {
        [page, browser] = await defaultBefore();
    });

    it('should undo filters if the user presses go-back', async () => {
        const filterInputSelector = '.runNumbers-textFilter';
        await goToPage(page, 'run-overview');

        await waitForTableLength(page, 6);
        await fillInput(page, filterInputSelector, '109', ['change']);
        await waitForTableLength(page, 1);
        await fillInput(page, filterInputSelector, '109,108', ['change']);
        await waitForTableLength(page, 2);
        await fillInput(page, filterInputSelector, '109,108,107', ['change']);
        await waitForTableLength(page, 3);
        await page.goBack();
        await waitForTableLength(page, 2);
        await page.goBack();
        await waitForTableLength(page, 1);
        await page.goBack();
        await waitForTableLength(page, 6);
    });

    after(async () => await defaultAfter(page, browser));
}
