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
    goToPage,
    fillInput,
    getPopoverSelector,
    getPeriodInputsSelectors,
    pressElement,
    openFilteringPanel,
} = require('../defaults.js');

module.exports = () => {
    let page;
    let browser;

    before(async () => {
        [page, browser] = await defaultBefore();
    });

    const getQueryParameters = (page) => Object.fromEntries(new URL(page.url()).searchParams.entries());

    it('should set filters from LogsOverview to the URL', async () => {
        await goToPage(page, 'log-overview');
        const firstCheckboxId = 'tag-dropdown-option-DPG';
        const popoverTrigger = '.createdAt-filter .popover-trigger';

        await page.waitForSelector(popoverTrigger);
        await openFilteringPanel(page);

        const popOverSelector = await getPopoverSelector(await page.$(popoverTrigger));
        const { fromDateSelector, toDateSelector, fromTimeSelector, toTimeSelector } = getPeriodInputsSelectors(popOverSelector);

        await fillInput(page, '.title-textFilter', 'bogusbogusbogus', ['change']);
        await fillInput(page, '#authorFilterText', 'Jane', ['change']);
        await fillInput(page, '.content-textFilter', 'particle', ['change']);
        await pressElement(page, '.tags-filter .dropdown-trigger');
        await pressElement(page, `#${firstCheckboxId}`, true);
        await fillInput(page, '.environments-filter input', '8E4aZTjY', ['change']);
        await fillInput(page, '.runNumbers-textFilter', '1,2', ['change']);
        await fillInput(page, '.fillNumbers-textFilter', '1, 6', ['change']);
        await fillInput(page, fromDateSelector, '2020-02-02', ['change']);
        await fillInput(page, toDateSelector, '2020-02-02', ['change']);
        await fillInput(page, fromTimeSelector, '11:00', ['change']);
        await fillInput(page, toTimeSelector, '12:00', ['change']);

        const queryParameters = getQueryParameters(page);
        expect(queryParameters).to.deep.equal({
            "page": "log-overview",
            "filter[author]": "Jane",
            "filter[title]": "bogusbogusbogus",
            "filter[content]": "particle",
            "filter[tags][values]": "DPG",
            "filter[tags][operation]": "and",
            "filter[runNumbers]": "1,2",
            "filter[environmentIds]": "8E4aZTjY",
            "filter[fillNumbers]": "1, 6",
            "filter[created][from]": "1580641200000",
            "filter[created][to]": "1580644800000"
        });
    });

    it('should set filters from EnvironmentsOverview to the URL', async () => {
        await goToPage(page, 'env-overview');
        const popoverTrigger = '.createdAt-filter .popover-trigger';

        await page.waitForSelector(popoverTrigger);
        await openFilteringPanel(page);

        const createdAtPopoverSelector = await getPopoverSelector(await page.$(popoverTrigger));
        const periodInputsSelectors = getPeriodInputsSelectors(createdAtPopoverSelector);

        await fillInput(page, '.runs-filter input', '10', ['change']);
        await fillInput(page, '.id-filter input', 'Dxi029djX, TDI59So3d', ['change']);
        await pressElement(page, '#checkboxes-checkbox-DESTROYED');
        await fillInput(page, '.historyItems-filter input', 'C-R-D-X', ['change']);
        await fillInput(page, periodInputsSelectors.fromDateSelector, '2019-08-09', ['change']);
        await fillInput(page, periodInputsSelectors.toDateSelector, '2019-08-10', ['change']);
        await fillInput(page, periodInputsSelectors.fromTimeSelector, '00:00', ['change']);
        await fillInput(page, periodInputsSelectors.toTimeSelector, '23:59', ['change']);

        const queryParameters = getQueryParameters(page);
        expect(queryParameters).to.deep.equal({
            "page": "env-overview",
            "filter[created][from]": "1565308800000",
            "filter[created][to]": "1565481540000",
            "filter[runNumbers]": "10",
            "filter[statusHistory]": "C-R-D-X",
            "filter[currentStatus]": "DESTROYED",
            "filter[ids]": "Dxi029djX, TDI59So3d"
        });
    });

    after(async () => await defaultAfter(page, browser));
}
