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
        await fillInput(page, '#beam-duration-filter-operand', '00:01:40', ['change']);
        await fillInput(page, '#run-duration-filter-operand', '00:00:00', ['change']);
        await pressElement(page, '#beam-types-checkbox-p-Pb');
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
        await goToPage(page, 'run-overview');
        const dipolePopoverSelector = await getPopoverSelector(await page.$('.aliceL3AndDipoleCurrent-filter .popover-trigger'));
        const startPopoverSelector = await getPopoverSelector(await page.$('.timeO2Start-filter .popover-trigger'));
        const endPopoverSelector = await getPopoverSelector(await page.$('.timeO2End-filter .popover-trigger'));

        const {
            fromDateSelector: startFromDateSelector,
            toDateSelector: startToDateSelector,
            fromTimeSelector: startFromTimeSelector,
            toTimeSelector: startToTimeSelector
        } = getPeriodInputsSelectors(startPopoverSelector);

        const {
            fromDateSelector: endFromDateSelector,
            toDateSelector: endToDateSelector,
            fromTimeSelector: endFromTimeSelector,
            toTimeSelector: endToTimeSelector
        } = getPeriodInputsSelectors(endPopoverSelector);

        await openFilteringPanel(page);
        await pressElement(page, '#detector-filter-dropdown-option-ITS', true);
        await pressElement(page, '#tag-dropdown-option-FOOD', true);
        await pressElement(page, '#run-definition-checkbox-PHYSICS', true);
        await pressElement(page, '.timeO2Start-filter .popover-trigger');
        await fillInput(page, startFromTimeSelector, '11:11', ['change']);
        await fillInput(page, startToTimeSelector, '14:00', ['change']);
        await fillInput(page, startFromDateSelector, '2021-02-03', ['change']);
        await fillInput(page, startToDateSelector, '2021-02-03', ['change']);
        await fillInput(page, endFromTimeSelector, '11:11', ['change']);
        await fillInput(page, endToTimeSelector, '14:00', ['change']);
        await fillInput(page, endFromDateSelector, '2021-02-03', ['change']);
        await fillInput(page, endToDateSelector, '2021-02-03', ['change']);
        await fillInput(page, '#duration-operand', '1500', ['change']);
        await pressElement(page, `${dipolePopoverSelector} .dropdown-option:last-child`, true);
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
            "filter[o2end][from]": "1612350660000",
            "filter[o2end][to]": "1612360800000",
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

    it('should set filters from lhcPriodOverview to the URL', async () => {
        await goToPage(page, 'lhc-period-overview');

        await fillInput(page, 'div.flex-row.items-baseline:nth-of-type(1) input[type=text]', 'LHC22a');
        await fillInput(page, 'div.flex-row.items-baseline:nth-of-type(2) input[type=text]', '2022');
        await fillInput(page, 'div.flex-row.items-baseline:nth-of-type(3) input[type=text]', 'PbPb');
        const queryParameters = getQueryParameters(page);
        expect(queryParameters).to.deep.equal({
            "page": "lhc-period-overview",
            "filter[names][]": "LHC22a",
            "filter[years][]": "2022",
            "filter[pdpBeamTypes][]": "PbPb"
        });
    });

    it('should set filters from qcFlagTypesOverview to the URL', async () => {
        await goToPage(page, 'qc-flag-types-overview');

        await fillInput(page, '.name-filter input[type=text]', 'bad');
        await fillInput(page, '.method-filter input[type=text]', 'bad');
        await pressElement(page, '#badFilterRadioBad', true);

        const queryParameters = getQueryParameters(page);
        expect(queryParameters).to.deep.equal({
            "page": "qc-flag-types-overview",
            "filter[names][]": "bad",
            "filter[methods][]": "bad",
            "filter[bad]": "true"
        });
    });

    it('should set filters from runsPerLhcPeriodOverview to the URL', async () => {
        await goToPage(page, 'runs-per-lhc-period', { queryParameters: { lhcPeriodId: 2 }});
        const startPopoverSelector = await getPopoverSelector(await page.$('.timeO2Start-filter .popover-trigger'));
        const endPopoverSelector = await getPopoverSelector(await page.$('.timeO2End-filter .popover-trigger'));
        const dipolePopoverSelector = await getPopoverSelector(await page.$('.aliceL3AndDipoleCurrent-filter .popover-trigger'));

        const {
            fromDateSelector: startFromDateSelector,
            toDateSelector: startToDateSelector,
            fromTimeSelector: startFromTimeSelector,
            toTimeSelector: startToTimeSelector
        } = getPeriodInputsSelectors(startPopoverSelector);

        const {
            fromDateSelector: endFromDateSelector,
            toDateSelector: endToDateSelector,
            fromTimeSelector: endFromTimeSelector,
            toTimeSelector: endToTimeSelector
        } = getPeriodInputsSelectors(endPopoverSelector);

        await fillInput(page, '#inelasticInteractionRateAvg-operand', '100000', ['change']);
        await fillInput(page, '#muInelasticInteractionRate-operand', '100000', ['change']);
        await fillInput(page, '#runOverviewFilter .runNumbers-textFilter', '101');
        await fillInput(page, '.fillNumbers-textFilter', '1, 3', ['change']);

        await pressElement(page, `${dipolePopoverSelector} .dropdown-option:last-child`, true);
        await fillInput(page, startFromTimeSelector, '11:11', ['change']);
        await fillInput(page, startToTimeSelector, '14:00', ['change']);
        await fillInput(page, startFromDateSelector, '2021-02-03', ['change']);
        await fillInput(page, startToDateSelector, '2021-02-03', ['change']);
        await fillInput(page, endFromTimeSelector, '11:11', ['change']);
        await fillInput(page, endToTimeSelector, '14:00', ['change']);
        await fillInput(page, endFromDateSelector, '2021-02-03', ['change']);
        await fillInput(page, endToDateSelector, '2021-02-03', ['change']);


        const queryParameters = getQueryParameters(page);
        expect(queryParameters).to.deep.equal({
            "page": "runs-per-lhc-period",
            "lhcPeriodId": "2",
            "filter[runNumbers]": "101",
            "filter[fillNumbers]": "1, 3",
            "filter[o2end][from]": "1612350660000",
            "filter[o2end][to]": "1612360800000",
            "filter[o2start][from]": "1612350660000",
            "filter[o2start][to]": "1612360800000",
            "filter[magnets][l3]": "30003",
            "filter[magnets][dipole]": "0",
            "filter[muInelasticInteractionRate][operator]": "=",
            "filter[muInelasticInteractionRate][limit]": "100000",
            "filter[inelasticInteractionRateAvg][operator]": "=",
            "filter[inelasticInteractionRateAvg][limit]": "100000"
        });
    });

    it('should set filters from DataPassesPerLhcPeriodOverview to the URL', async () => {
        await goToPage(page, 'data-passes-per-lhc-period-overview', { queryParameters: { lhcPeriodId: 2 }});

        await fillInput(page, 'div.flex-row.items-baseline:nth-of-type(1) input[type=text]', 'LHC22b_apass1', ['change']);
        await pressElement(page, '#checkboxes-checkbox-test', true);


        const queryParameters = getQueryParameters(page);
        expect(queryParameters).to.deep.equal({
            "page": "data-passes-per-lhc-period-overview",
            "lhcPeriodId": "2",
            "filter[names][]": "LHC22b_apass1",
            "filter[include][byName]": "test"
        });
    });

    after(async () => await defaultAfter(page, browser));
}
