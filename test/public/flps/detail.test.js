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

const { defaultBefore, defaultAfter, expectInnerText, pressElement, goToPage, expectUrlParams, waitForNavigation } = require('../defaults.js');
const { resetDatabaseContent } = require('../../utilities/resetDatabaseContent.js');

module.exports = () => {
    let page;
    let browser;

    before(async () => {
        [page, browser] = await defaultBefore(page, browser);
        await resetDatabaseContent();
    });
    after(async () => {
        [page, browser] = await defaultAfter(page, browser);
    });

    it('flp detail loads correctly', async () => {
        await goToPage(page, 'flp-detail', { queryParameters: { id: 1 } });

        await expectInnerText(page, 'h2', 'Flp #FLP-TPC-1');
    });

    it('notifies if a specified flp id is invalid', async () => {
        // Navigate to a flp detail view with an id that cannot exist
        await goToPage(page, 'flp-detail', { queryParameters: { id: 'abc' } });

        // We expect there to be an error message
        await expectInnerText(page, '.alert', 'Invalid Attribute: "params.flpId" must be a number');
    });

    it('notifies if a specified flp id is not found', async () => {
        // Navigate to a flp detail view with an id that cannot exist
        await goToPage(page, 'flp-detail', { queryParameters: { id: 999 } });

        // We expect there to be an error message
        await expectInnerText(page, '.alert', 'Flp with this id (999) could not be found');
    });

    it('allows navigating to an associated run', async () => {
        const runNumber = 1;

        // Navigate to a flp detail view
        await goToPage(page, 'flp-detail', { queryParameters: { id: 1 } });

        // We expect the correct associated runs to be shown
        await expectInnerText(page, '#Flp-run', `Run:\n${runNumber}`);

        // We expect the associated run to be clickable with a valid link
        await waitForNavigation(page, () => pressElement(page, '#Flp-run a'));

        // We expect the link to navigate to the correct run detail page
        expectUrlParams(page, { page: 'run-detail', runNumber: runNumber });
    });
};
