const { waitForNavigation, pressElement, getInnerText, expectUrlParams, waitForTableLength } = require('../defaults.js');

/**
 * Navigate to Runs per LHC period
 *
 * @param {Puppeteer.Page} page page
 * @param {number} lhcPeriodId id of lhc period on LHC Period overview page
 * @param {number} expectedRowsCount expected number of rows on runs per data pass page
 * @return {Promise<void>} promise
 */
exports.navigateToRunsPerLhcPeriod = async (page, lhcPeriodId, expectedRowsCount) => {
    await waitForNavigation(page, () => pressElement(page, 'a#lhc-period-overview', true));
    await waitForNavigation(page, () => pressElement(page, `#row${lhcPeriodId}-associatedRuns a`, true));
    expectUrlParams(page, { page: 'runs-per-lhc-period', lhcPeriodId }, ['pdpBeamType']);
    await waitForTableLength(page, expectedRowsCount);
};

/**
 * Navigate to Runs per Data Pass page
 *
 * @param {Puppeteer.Page} page page
 * @param {number} lhcPeriodId id of lhc period on LHC Period overview page
 * @param {number} dataPassId id of data pass on Data Passes per LHC Period page
 * @param {number} expectedRowsCount expected number of rows on runs per data pass page
 * @return {Promise<void>} promise
 */
exports.navigateToRunsPerDataPass = async (page, lhcPeriodId, dataPassId, expectedRowsCount) => {
    await waitForNavigation(page, () => pressElement(page, 'a#lhc-period-overview', true));
    await waitForNavigation(page, () => pressElement(page, `#row${lhcPeriodId}-associatedDataPasses a`, true));
    expectUrlParams(page, { page: 'data-passes-per-lhc-period-overview', lhcPeriodId });
    await page.waitForSelector('th#description');
    await waitForNavigation(page, () => pressElement(page, `#row${dataPassId}-associatedRuns a`, true));
    expectUrlParams(page, { page: 'runs-per-data-pass', dataPassId }, ['pdpBeamType']);
    await waitForTableLength(page, expectedRowsCount);
};


/**
 * Navigate to Runs per Simulation Pass page
 *
 * @param {Puppeteer.Page} page page
 * @param {number} lhcPeriodId id of lhc period on LHC Period overview page
 * @param {number} simulationPassId id of data pass on Data Passes per LHC Period page
 * @param {number} expectedRowsCount expected number of rows on runs per data pass page
 * @return {Promise<void>} promise
 */
exports.navigateToRunsPerSimulationPass = async (page, lhcPeriodId, simulationPassId, expectedRowsCount) => {
    await waitForNavigation(page, () => pressElement(page, 'a#lhc-period-overview', true));
    await waitForNavigation(page, () => pressElement(page, `#row${lhcPeriodId}-associatedSimulationPasses a`, true));
    expectUrlParams(page, { page: 'simulation-passes-per-lhc-period-overview', lhcPeriodId });
    await page.waitForSelector('th#description');
    await waitForNavigation(page, () => pressElement(page, `#row${simulationPassId}-associatedRuns a`, true));
    expectUrlParams(page, { page: 'runs-per-simulation-pass', simulationPassId });
    await waitForTableLength(page, expectedRowsCount);
};
