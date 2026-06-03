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
    pressElement,
    waitForTableTotalRowsCountToEqual,
    getPopoverSelector,
    getPeriodInputsSelectors,
} = require('../defaults.js');

module.exports = () => {
    let page;
    let browser;

    before(async () => {
        [page, browser] = await defaultBefore();
    });
    
    // Not all filters for the pages will be checked, as many of them are identical.
    const runSelectionFiltersChecks = {
        'tags': [{ count: 1, selector: '#tag-dropdown-option-FOOD' }, { count: 0, selector: '#tag-dropdown-option-CTP' }, { count: 1, selector: '#tag-filter-combination-operator-radio-button-or' }],
        'beam mode': [{ count: 1, selector: '#beam-mode-dropdown-option-NO\\ BEAM' }, { count: 2, selector: '#beam-mode-dropdown-option-UNSTABLE\\ BEAMS' }],
        'definitions': [{ count: 1, selector: '#run-definition-checkbox-TECHNICAL' }, { count: 3, selector: '#run-definition-checkbox-SYNTHETIC' }],
        'quality': [{ count: 1, selector: '#checkboxes-checkbox-none' }, { count: 3, selector: '#checkboxes-checkbox-bad' }],
        'detectors': [{ count: 3, selector: '#detector-filter-dropdown-option-ACO' }, { count: 0, selector: '#detector-filter-dropdown-option-FDD' }, { count: 3, selector: '#detector-filter-combination-operator-radio-button-or' }],
        'runTypes': [{ count: 4, selector: '#run-types-dropdown-option-14' }, { count: 5, selector: '#run-types-dropdown-option-2' }],
        'ddFLP': [{ count: 101, selector: '#ddFlpFilterRadioON' }, { count: 8, selector: '#ddFlpFilterRadioOFF' }],
        'magnets': [{ count: 1, selector: '#l3-dipole-current-dropdown-option-20003kA\\/0kA' }, { count: 3, selector: '#l3-dipole-current-dropdown-option-30003kA\\/0kA' }],
    };

    it('should undo filters if the user presses go-back on the runs page', async () => {
        await goToPage(page, 'run-overview');

        const startPopoverSelector = await getPopoverSelector(await page.$('.timeO2Start-filter .popover-trigger'));

        const { fromDateSelector, fromTimeSelector } = getPeriodInputsSelectors(startPopoverSelector);

        for (const checks of Object.values(runSelectionFiltersChecks)) {
            await waitForTableTotalRowsCountToEqual(page, 109);

            for (const { count, selector } of checks) {
                await pressElement(page, selector, true);
                await waitForTableTotalRowsCountToEqual(page, count);
            }
            
            for (const { count } of checks.reverse()) {
                await waitForTableTotalRowsCountToEqual(page, count);
                await page.goBack();
            }

            await waitForTableTotalRowsCountToEqual(page, 109);
        }

        // Run duration
        await page.select('#duration-operator', '>');
        await fillInput(page, '#duration-operand', 500, ['change']);
        await waitForTableTotalRowsCountToEqual(page, 8);
        await page.select('#duration-operator', '=');
        await waitForTableTotalRowsCountToEqual(page, 0);
        await page.goBack();
        await waitForTableTotalRowsCountToEqual(page, 8);
        await page.goBack();
        await waitForTableTotalRowsCountToEqual(page, 109);
        
        // EorReason filter
        await page.select('#eorCategories', 'DETECTORS');
        await waitForTableTotalRowsCountToEqual(page, 3);
        await page.select('#eorTitles', 'CPV');
        await waitForTableTotalRowsCountToEqual(page, 2);
        await fillInput(page, '#eorDescription', 'some', ['change']);
        await waitForTableTotalRowsCountToEqual(page, 1);
        await page.goBack();
        await waitForTableTotalRowsCountToEqual(page, 2);
        await page.goBack();
        await waitForTableTotalRowsCountToEqual(page, 3);
        await page.goBack();
        await waitForTableTotalRowsCountToEqual(page, 109);

        // O2 Start Filter:
        await fillInput(page, fromTimeSelector, '11:11', ['change']);
        await fillInput(page, fromDateSelector, '2021-02-03', ['change']);
        await waitForTableTotalRowsCountToEqual(page, 1);
        await fillInput(page, fromDateSelector, '2020-02-03', ['change']);
        await waitForTableTotalRowsCountToEqual(page, 2);
        await page.goBack();
        await waitForTableTotalRowsCountToEqual(page, 1);
        await page.goBack();
        await waitForTableTotalRowsCountToEqual(page, 109);
    });

    after(async () => await defaultAfter(page, browser));
}
