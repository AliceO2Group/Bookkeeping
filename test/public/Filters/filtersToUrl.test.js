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
    waitForTableLength,
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

    it('should set filters from LhcFillsOverview to the URL', async () => {
        await goToPage(page, 'lhc-fill-overview');
        await waitForTableLength(page, 5);
        const filterSBDurationOperand= '#beam-duration-filter-operand';
        const filterRunDurationOperand= '#run-duration-filter-operand';
        const filterBeamTypeP_Pb = '#beam-types-checkbox-p-Pb';
        const sbEndPopoverTrigger = '.stableBeamsEnd-filter .popover-trigger';
        const sbStartPopoverTrigger = '.stableBeamsStart-filter .popover-trigger';
        const sbStartPopOverSelector = await getPopoverSelector(await page.$(sbStartPopoverTrigger));
        const sbEndPopOverSelector = await getPopoverSelector(await page.$(sbEndPopoverTrigger));
        const filterSchemeNameInputField= '.fillingSchemeName-filter input';
        const {
            fromDateSelector: sbStartFromDateSelector,
            toDateSelector: sbStartToDateSelector,
            fromTimeSelector: sbStartFromTimeSelector,
            toTimeSelector: sbStartToTimeSelector
        } = getPeriodInputsSelectors(sbStartPopOverSelector);

        const {
            fromDateSelector: sbEndFromDateSelector,
            toDateSelector: sbEndToDateSelector,
            fromTimeSelector: sbEndFromTimeSelector,
            toTimeSelector: sbEndToTimeSelector
        } = getPeriodInputsSelectors(sbEndPopOverSelector);

        await openFilteringPanel(page);
        await fillInput(page, filterSBDurationOperand, '00:01:40', ['change']);
        await fillInput(page, filterRunDurationOperand, '00:00:00', ['change']);
        await pressElement(page, filterBeamTypeP_Pb);
        await fillInput(page, sbStartFromDateSelector, '2019-08-08', ['change']);
        await fillInput(page, sbStartToDateSelector, '2019-08-08', ['change']);
        await fillInput(page, sbStartFromTimeSelector, '10:00', ['change']);
        await fillInput(page, sbStartToTimeSelector, '12:00', ['change']);
        await fillInput(page, sbEndFromDateSelector, '2022-03-22', ['change']);
        await fillInput(page, sbEndToDateSelector, '2022-03-22', ['change']);
        await fillInput(page, sbEndFromTimeSelector, '01:00', ['change']);
        await fillInput(page, sbEndToTimeSelector, '23:59', ['change']);
        await fillInput(page, filterSchemeNameInputField, 'Single_12b_8_1024_8_2018', ['change']);

        const queryParameters = getQueryParameters(page);
        expect(queryParameters).to.deep.equal({
            "page": "lhc-fill-overview",
            "filter[beamDuration][operator]": "=",
            "filter[beamDuration][limit]": "00:01:40",
            "filter[runDuration][operator]": "=",
            "filter[runDuration][limit]": "00:00:00",
            "filter[hasStableBeams]": "true",
            "filter[stableBeamsEnd][from]": "1647910800000",
            "filter[stableBeamsEnd][to]": "1647993540000",
            "filter[stableBeamsStart][from]": "1565258400000",
            "filter[stableBeamsStart][to]": "1565265600000",
            "filter[beamTypes]": "p-Pb",
            "filter[schemeName]": "Single_12b_8_1024_8_2018"
        });
    });

    it('should set filters from runsOverview to the URL', async () => {
        await goToPage(page, 'lhc-fill-overview');
        await goToPage(page, 'run-overview');
        const o2StartPopoverSelector = await getPopoverSelector(await page.$('.timeO2Start-filter .popover-trigger'));
        const { fromTimeSelector, toTimeSelector, fromDateSelector, toDateSelector } = getPeriodInputsSelectors(o2StartPopoverSelector);
        const popoverSelector = await getPopoverSelector(await page.$('.aliceL3AndDipoleCurrent-filter .popover-trigger'));

        await openFilteringPanel(page);
        await pressElement(page, '#detector-filter-dropdown-option-ITS', true);
        await pressElement(page, '#tag-dropdown-option-FOOD', true);
        await pressElement(page, '#run-definition-checkbox-PHYSICS', true);
        await pressElement(page, '.timeO2Start-filter .popover-trigger');
        await fillInput(page, fromTimeSelector, '11:11', ['change']);
        await fillInput(page, toTimeSelector, '14:00', ['change']);
        await fillInput(page, fromDateSelector, '2021-02-03', ['change']);
        await fillInput(page, toDateSelector, '2021-02-03', ['change']);
        await fillInput(page, '#duration-operand', '1500', ['change']);
        await pressElement(page, `${popoverSelector} .dropdown-option:last-child`, true);
        await pressElement(page, '#checkboxes-checkbox-bad');
        await pressElement(page, '#triggerValue-checkbox-OFF');
        await fillInput(page, '#runOverviewFilter .runNumbers-textFilter', '101');
        await fillInput(page, '.fillNumbers-textFilter', '1, 3', ['change']);
        await fillInput(page, '.environmentIds-textFilter', 'Dxi029djX, TDI59So3d', ['change']);
        await pressElement(page, '#run-types-dropdown-option-2', true);
        await pressElement(page, '#beam-mode-dropdown-option-NO\\ BEAM', true);
        await fillInput(page, '#nDetectors-operand', '1', ['change']);
        await fillInput(page, '#nFlps-operand', '10', ['change']);
        await fillInput(page, '#nEpns-operand', '10', ['change']);
        await fillInput(page, '#ctfFileCount-operand', '1', ['change']);
        await fillInput(page, '#tfFileCount-operand', '1', ['change']);
        await fillInput(page, '#otherFileCount-operand', '1', ['change']);
        await pressElement(page, '#epnFilterRadioOFF', true);
        await page.select('#eorCategories', 'DETECTORS');
        await page.select('#eorTitles', 'CPV');
        await fillInput(page, '#eorDescription', 'some', ['change']);

        const queryParameters = getQueryParameters(page);
        expect(queryParameters).to.deep.equal({
            "page": "run-overview",
            "filter[runNumbers]": "101",
            "filter[detectors][operator]": "and",
            "filter[detectors][values]": "ITS",
            "filter[tags][values]": "FOOD",
            "filter[tags][operation]": "and",
            "filter[fillNumbers]": "1, 3",
            "filter[o2start][from]": "1612350660000",
            "filter[o2start][to]": "1612360800000",
            "filter[definitions]": "PHYSICS",
            "filter[runDuration][operator]": "=",
            "filter[runDuration][limit]": "90000000",
            "filter[environmentIds]": "Dxi029djX, TDI59So3d",
            "filter[runTypes][]": "2",
            "filter[beamModes][]": "NO BEAM",
            "filter[runQualities]": "bad",
            "filter[nDetectors][operator]": "=",
            "filter[nDetectors][limit]": "1",
            "filter[nEpns][operator]": "=",
            "filter[nEpns][limit]": "10",
            "filter[nFlps][operator]": "=",
            "filter[nFlps][limit]": "10",
            "filter[ctfFileCount][operator]": "=",
            "filter[ctfFileCount][limit]": "1",
            "filter[tfFileCount][operator]": "=",
            "filter[tfFileCount][limit]": "1",
            "filter[otherFileCount][operator]": "=",
            "filter[otherFileCount][limit]": "1",
            "filter[eorReason][category]": "DETECTORS",
            "filter[eorReason][title]": "CPV",
            "filter[eorReason][description]": "some",
            "filter[magnets][l3]": "30003",
            "filter[magnets][dipole]": "0",
            "filter[epn]": "false",
            "filter[triggerValues]": "OFF"
        });
    });

    after(async () => await defaultAfter(page, browser));
}
