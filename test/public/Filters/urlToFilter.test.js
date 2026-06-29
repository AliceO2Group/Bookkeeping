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
    fillInput,
    getPopoverSelector,
    getPeriodInputsSelectors,
    pressElement,
    openFilteringPanel,
    expectInputValue,
} = require('../defaults.js');

module.exports = () => {
    let page;
    let browser;

    before(async () => {
        [page, browser] = await defaultBefore();
    });

    it('should apply filters from url in logsOverviewPage', async () => {
        const url = 'http://localhost:4000/?page=log-overview&filter[author]=Jane&filter[title]=bogusbogusbogus&filter[content]=particle'+
                    '&filter[tags][values]=DPG&filter[tags][operation]=and&filter[runNumbers]=1%2C2&filter[environmentIds]=8E4aZTjY'+
                    '&filter[fillNumbers]=1%2C%206&filter[created][from]=1580637600000&filter[created][to]=1580641200000';


        await page.goto(url, { waitUntil: 'load' });
        
        const firstCheckboxId = 'tag-dropdown-option-DPG';
        const popoverTrigger = '.createdAt-filter .popover-trigger';

        await page.waitForSelector(popoverTrigger);
        await openFilteringPanel(page);

        const popOverSelector = await getPopoverSelector(await page.$(popoverTrigger));
        const { fromDateSelector, toDateSelector, fromTimeSelector, toTimeSelector } = getPeriodInputsSelectors(popOverSelector);

        await expectInputValue(page, '.title-textFilter', 'bogusbogusbogus');
        await expectInputValue(page, '#authorFilterText', 'Jane');
        await expectInputValue(page, '.content-textFilter', 'particle');
        await pressElement(page, '.tags-filter .dropdown-trigger');
        await page.waitForSelector(`#${firstCheckboxId}:checked`);
        await expectInputValue(page, '.environments-filter input', '8E4aZTjY');
        await expectInputValue(page, '.runNumbers-textFilter', '1,2');
        await expectInputValue(page, '.fillNumbers-textFilter', '1, 6');
        await expectInputValue(page, fromDateSelector, '2020-02-02');
        await expectInputValue(page, toDateSelector, '2020-02-02');
        
        await expectInputValue(page, fromTimeSelector, '10:00');
        await expectInputValue(page, toTimeSelector, '11:00');
    });

    it('should set filters from EnvironmentsOverview to the URL', async () => {
        const url = 'http://localhost:4000/?page=env-overview&filter[created][from]=1565301600000&filter[created][to]=1565474340000' +
                    '&filter[runNumbers]=10&filter[statusHistory]=C-R-D-X&filter[currentStatus]=DESTROYED&filter[ids]=Dxi029djX%2C%20TDI59So3d';
        await page.goto(url, { waitUntil: 'load' });
        await openFilteringPanel(page);

        const popoverTrigger = '.createdAt-filter .popover-trigger';
        const createdAtPopoverSelector = await getPopoverSelector(await page.$(popoverTrigger));
        const periodInputsSelectors = getPeriodInputsSelectors(createdAtPopoverSelector);

        await expectInputValue(page, '.runs-filter input', '10');
        await expectInputValue(page, '.id-filter input', 'Dxi029djX, TDI59So3d');
        await page.waitForSelector('#checkboxes-checkbox-DESTROYED:checked');
        await expectInputValue(page, '.historyItems-filter input', 'C-R-D-X');
        await expectInputValue(page, periodInputsSelectors.fromDateSelector, '2019-08-08');
        await expectInputValue(page, periodInputsSelectors.toDateSelector, '2019-08-10');
        await expectInputValue(page, periodInputsSelectors.fromTimeSelector, '22:00');
        await expectInputValue(page, periodInputsSelectors.toTimeSelector, '21:59');
    });

    it('should set filters from LhcFillsOverview to the URL', async () => {
        const url = 'http://localhost:4000/?page=lhc-fill-overview&filter[beamDuration][operator]=%3D&filter[beamDuration][limit]=00%3A01%3A40&' + 
                    'filter[runDuration][operator]=%3D&filter[runDuration][limit]=00%3A00%3A00&filter[hasStableBeams]=true&filter[stableBeamsStart][from]=1565251200000&' + 
                    'filter[stableBeamsStart][to]=1565258400000&filter[stableBeamsEnd][from]=1647907200000&filter[stableBeamsEnd][to]=1647989940000&filter[beamTypes]=p-Pb&filter[schemeName]=Single_12b_8_1024_8_2018';
        
        await page.goto(url, { waitUntil: 'load' });

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
        await expectInputValue(page, '#beam-duration-filter-operand', '00:01:40');
        await expectInputValue(page, '#run-duration-filter-operand', '00:00:00');
        await expectInputValue(page, sbStartFromDateSelector, '2019-08-08');
        await expectInputValue(page, sbStartToDateSelector, '2019-08-08');
        await expectInputValue(page, sbStartFromTimeSelector, '08:00');
        await expectInputValue(page, sbStartToTimeSelector, '10:00');
        await expectInputValue(page, sbEndFromDateSelector, '2022-03-22');
        await expectInputValue(page, sbEndToDateSelector, '2022-03-22');
        await expectInputValue(page, sbEndFromTimeSelector, '00:00');
        await expectInputValue(page, sbEndToTimeSelector, '22:59');
        await expectInputValue(page, filterSchemeNameInputField, 'Single_12b_8_1024_8_2018');
        await page.waitForSelector('#beam-types-checkbox-p-Pb:checked');
    });

    it('should set filters from runsOverview to the URL', async () => {
        const url = 'http://localhost:4000/?page=run-overview&filter[runNumbers]=101&filter[detectors][operator]=and&filter[detectors][values]=ITS&filter[tags][values]=FOOD&' +
                    'filter[tags][operation]=and&filter[fillNumbers]=1%2C%203&filter[o2start][from]=1612347060000&filter[o2start][to]=1612357200000&filter[o2end][from]=1612347060000&' +
                    'filter[o2end][to]=1612357200000&filter[definitions]=PHYSICS&filter[runDuration][operator]=%3D&filter[runDuration][limit]=90000000' +
                    '&filter[environmentIds]=Dxi029djX%2C%20TDI59So3d&filter[runTypes]=2&filter[beamModes]=NO%20BEAM&filter[runQualities]=bad&filter[nDetectors][operator]=%3D&' +
                    'filter[nDetectors][limit]=1&filter[nEpns][operator]=%3D&filter[nEpns][limit]=10&filter[nFlps][operator]=%3D&filter[nFlps][limit]=10&filter[ctfFileCount][operator]=%3D&' +
                    'filter[ctfFileCount][limit]=1&filter[tfFileCount][operator]=%3D&filter[tfFileCount][limit]=1&filter[otherFileCount][operator]=%3D&filter[otherFileCount][limit]=1&' +
                    'filter[eorReason][category]=DETECTORS&filter[eorReason][title]=CPV&filter[eorReason][description]=some&filter[magnets][l3]=30003&filter[magnets][dipole]=0&filter[epn]=false&filter[triggerValues]=OFF';

        await page.goto(url, { waitUntil: 'load' });
        
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
        await page.waitForSelector('#detector-filter-dropdown-option-ITS:checked');
        await page.waitForSelector('#run-types-dropdown-option-2:checked');
        await page.waitForSelector('#beam-mode-dropdown-option-NO\\ BEAM:checked');
        await page.waitForSelector('#tag-dropdown-option-FOOD:checked');
        await page.waitForSelector('#run-definition-checkbox-PHYSICS:checked');
        await page.waitForSelector('#epnFilterRadioOFF:checked');
        await pressElement(page, '.timeO2Start-filter .popover-trigger');
        await page.waitForSelector('#checkboxes-checkbox-bad:checked');
        await page.waitForSelector('#triggerValue-checkbox-OFF:checked');
        await page.waitForSelector(`${dipolePopoverSelector} .dropdown-option:last-child input:checked`);
        await expectInputValue(page, '#duration-operand', '1500');
        await expectInputValue(page, '#runOverviewFilter .runNumbers-textFilter', '101');
        await expectInputValue(page, '.fillNumbers-textFilter', '1, 3');
        await expectInputValue(page, '.environmentIds-textFilter', 'Dxi029djX, TDI59So3d');
        await expectInputValue(page, '#nDetectors-operand', '1');
        await expectInputValue(page, '#nFlps-operand', '10');
        await expectInputValue(page, '#nEpns-operand', '10');
        await expectInputValue(page, '#ctfFileCount-operand', '1');
        await expectInputValue(page, '#tfFileCount-operand', '1');
        await expectInputValue(page, '#otherFileCount-operand', '1');
        await expectInputValue(page, '#eorDescription', 'some');
        await expectInputValue(page, '#eorTitles', 'CPV');
        await expectInputValue(page, '#eorCategories', 'DETECTORS');
        await expectInputValue(page, startFromTimeSelector, '10:11');
        await expectInputValue(page, startToTimeSelector, '13:00');
        await expectInputValue(page, startFromDateSelector, '2021-02-03');
        await expectInputValue(page, startToDateSelector, '2021-02-03');
        await expectInputValue(page, endFromTimeSelector, '10:11');
        await expectInputValue(page, endToTimeSelector, '13:00');
        await expectInputValue(page, endFromDateSelector, '2021-02-03');
        await expectInputValue(page, endToDateSelector, '2021-02-03');
    });

    it('should set filters from lhcPriodOverview to the URL', async () => {
        const url = 'http://localhost:4000/?page=lhc-period-overview&filter[names][]=LHC22a&filter[years][]=2022&filter[pdpBeamTypes][]=PbPb';
        await page.goto(url, { waitUntil: 'load' });

        await expectInputValue(page, 'div.flex-row.items-baseline:nth-of-type(1) input[type=text]', 'LHC22a');
        await expectInputValue(page, 'div.flex-row.items-baseline:nth-of-type(2) input[type=text]', '2022');
        await expectInputValue(page, 'div.flex-row.items-baseline:nth-of-type(3) input[type=text]', 'PbPb');
    });

    it('should set filters from qcFlagTypesOverview to the URL', async () => {
        const url = 'http://localhost:4000/?page=qc-flag-types-overview&filter[names][]=bad&filter[methods][]=bad&filter[bad]=true';
        await page.goto(url, { waitUntil: 'load' });

        await expectInputValue(page, '.name-filter input[type=text]', 'bad');
        await expectInputValue(page, '.method-filter input[type=text]', 'bad');
        await page.waitForSelector('#badFilterRadioBad:checked');
    });

    it('should set filters from runsPerLhcPeriodOverview to the URL', async () => {
        const url = 'http://localhost:4000/?page=runs-per-lhc-period&lhcPeriodId=2&filter[runNumbers]=101&filter[fillNumbers]=1%2C%203&filter[o2start][from]=1612347060000&' +
                    'filter[o2start][to]=1612357200000&filter[o2end][from]=1612347060000&filter[o2end][to]=1612357200000&filter[magnets][l3]=30003&filter[magnets][dipole]=0&' +
                    'filter[muInelasticInteractionRate][operator]=%3D&filter[muInelasticInteractionRate][limit]=100000&filter[inelasticInteractionRateAvg][operator]=%3D&filter[inelasticInteractionRateAvg][limit]=100000';
        await page.goto(url, { waitUntil: 'load' });

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

        await expectInputValue(page, '#inelasticInteractionRateAvg-operand', '100000');
        await expectInputValue(page, '#muInelasticInteractionRate-operand', '100000');
        await expectInputValue(page, '#runOverviewFilter .runNumbers-textFilter', '101');
        await expectInputValue(page, '.fillNumbers-textFilter', '1, 3');
        await expectInputValue(page, startFromTimeSelector, '10:11');
        await expectInputValue(page, startToTimeSelector, '13:00');
        await expectInputValue(page, startFromDateSelector, '2021-02-03');
        await expectInputValue(page, startToDateSelector, '2021-02-03');
        await expectInputValue(page, endFromTimeSelector, '10:11');
        await expectInputValue(page, endToTimeSelector, '13:00');
        await expectInputValue(page, endFromDateSelector, '2021-02-03');
        await expectInputValue(page, endToDateSelector, '2021-02-03');
        await page.waitForSelector(`${dipolePopoverSelector} .dropdown-option:last-child input:checked`);
    });

    it('should set filters from DataPassesPerLhcPeriodOverview to the URL', async () => {
        const url = 'http://localhost:4000/?page=data-passes-per-lhc-period-overview&lhcPeriodId=2&filter[names][]=LHC22b_apass1&filter[permittedNonPhysicsNames]=test';
        await page.goto(url, { waitUntil: 'load' });

        await expectInputValue(page, 'div.flex-row.items-baseline:nth-of-type(1) input[type=text]', 'LHC22b_apass1');
        await page.waitForSelector('#checkboxes-checkbox-test:checked');
    });
    
    it('should set filters from DataPassesPerSimulationPassOverview to the URL', async () => {
        const url = 'http://localhost:4000/?page=data-passes-per-simulation-pass-overview&simulationPassId=1&filter[names][]=LHC22b_apass1&filter[permittedNonPhysicsNames]=test';
        await page.goto(url, { waitUntil: 'load' });
        
        await expectInputValue(page, 'div.flex-row.items-baseline:nth-of-type(1) input[type=text]', 'LHC22b_apass1');
        await page.waitForSelector('#checkboxes-checkbox-test:checked');
    });
    
    it('should set filters from AnchoredSimulationPassesOverview to the URL', async () => {
        const url = 'http://localhost:4000/?page=anchored-simulation-passes-overview&dataPassId=1&filter[names][]=LHC23k6c';
        await page.goto(url, { waitUntil: 'load' });
        
        await expectInputValue(page, '.name-filter input', 'LHC23k6c');
    });
    
    it('should set filters from RunsPerSimulationPass to the URL', async () => {
        const url = 'http://localhost:4000/?page=runs-per-simulation-pass&simulationPassId=2&filter[o2start][from]=1612347060000&' +
                    'filter[o2start][to]=1612357200000&filter[o2end][from]=1612347060000&filter[o2end][to]=1612357200000&' +
                    'filter[magnets][l3]=30003&filter[magnets][dipole]=0&filter[inelasticInteractionRateAtStart][operator]=%3D&' +
                    'filter[inelasticInteractionRateAtStart][limit]=1&filter[inelasticInteractionRateAtMid][operator]=%3D&' +
                    'filter[inelasticInteractionRateAtMid][limit]=1&filter[inelasticInteractionRateAtEnd][operator]=%3D&' +
                    'filter[inelasticInteractionRateAtEnd][limit]=1&filter[detectorsQcNotBadFraction][mcReproducibleAsNotBad]=true&' +
                    'filter[detectorsQcNotBadFraction][_20][operator]=%3D&filter[detectorsQcNotBadFraction][_20][limit]=0.01&' +
                    'filter[detectorsQcNotBadFraction][_17][operator]=%3D&filter[detectorsQcNotBadFraction][_17][limit]=0.01';

        await page.goto(url, { waitUntil: 'load' });
        
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
        await expectInputValue(page, '.inelasticInteractionRateAtMid-filter input', '1');
        await expectInputValue(page, '.inelasticInteractionRateAtEnd-filter input', '1');
        await expectInputValue(page, '.inelasticInteractionRateAtStart-filter input', '1');
        await expectInputValue(page, startFromTimeSelector, '10:11');
        await expectInputValue(page, startToTimeSelector, '13:00');
        await expectInputValue(page, startFromDateSelector, '2021-02-03');
        await expectInputValue(page, startToDateSelector, '2021-02-03');
        await expectInputValue(page, endFromTimeSelector, '10:11');
        await expectInputValue(page, endToTimeSelector, '13:00');
        await expectInputValue(page, endFromDateSelector, '2021-02-03');
        await expectInputValue(page, endToDateSelector, '2021-02-03');
        await page.waitForSelector(`${dipolePopoverSelector} .dropdown-option:last-child input:checked`);
        await page.waitForSelector('#mcReproducibleAsNotBadToggle input:checked');

        
        // These two are detectorQCNotBadFraction[_id] filters. There are a dozen more, but they are all identical hence why only these were tested
        await expectInputValue(page, '.QC-SPECIFIC-filter input', '1');
        await expectInputValue(page, '.ACO-filter input', '1');
    });

    it('should set filters from RunsPerSimulationPass to the URL', async () => {
        const url = 'http://localhost:4000/?page=runs-per-data-pass&dataPassId=1&filter[detectors][operator]=and&filter[detectors][values]=ITS&' +
                    'filter[tags][values]=FOOD&filter[tags][operation]=and&filter[o2start][from]=1612347060000&filter[o2start][to]=1612357200000&' +
                    'filter[o2end][from]=1612347060000&filter[o2end][to]=1612357200000&filter[runDuration][operator]=%3D&filter[runDuration][limit]=90000000&' +
                    'filter[magnets][l3]=30003&filter[magnets][dipole]=0&filter[muInelasticInteractionRate][operator]=%3D&filter[muInelasticInteractionRate][limit]=1&' +
                    'filter[inelasticInteractionRateAvg][operator]=%3D&filter[inelasticInteractionRateAvg][limit]=1&filter[detectorsQcNotBadFraction][mcReproducibleAsNotBad]=true&' +
                    'filter[detectorsQcNotBadFraction][_20][operator]=%3D&filter[detectorsQcNotBadFraction][_20][limit]=0.01&filter[detectorsQcNotBadFraction][_17][operator]=%3D&' +
                    'filter[detectorsQcNotBadFraction][_17][limit]=0.01&filter[gaq][notBadFraction][operator]=%3D&filter[gaq][notBadFraction][limit]=0.01&filter[gaq][mcReproducibleAsNotBad]=true';

        await page.goto(url, { waitUntil: 'load' });

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
        await expectInputValue(page, startFromTimeSelector, '10:11');
        await expectInputValue(page, startToTimeSelector, '13:00');
        await expectInputValue(page, startFromDateSelector, '2021-02-03');
        await expectInputValue(page, startToDateSelector, '2021-02-03');
        await expectInputValue(page, endFromTimeSelector, '10:11');
        await expectInputValue(page, endToTimeSelector, '13:00');
        await expectInputValue(page, endFromDateSelector, '2021-02-03');
        await expectInputValue(page, endToDateSelector, '2021-02-03');
        await expectInputValue(page, '#duration-operand', '1500');
        await expectInputValue(page, '.muInelasticInteractionRate-filter input', '1');
        await expectInputValue(page, '.inelasticInteractionRateAvg-filter input', '1');
        await expectInputValue(page, '.globalAggregatedQuality-filter input', '1');
        await fillInput(page, '.ACO-filter input', '1', ['change']);
        await fillInput(page, '.QC-SPECIFIC-filter input', '1', ['change']);
        
        await page.waitForSelector('#detector-filter-dropdown-option-ITS');
        await page.waitForSelector('#tag-dropdown-option-FOOD');
        await page.waitForSelector(`${dipolePopoverSelector} .dropdown-option:last-child input:checked`);
        await page.waitForSelector('#mcReproducibleAsNotBadToggle input:checked');
    });

    after(async () => await defaultAfter(page, browser));
}
