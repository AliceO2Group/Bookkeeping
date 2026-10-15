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

    /*
     * The runs per data pass model is kept between visits, so the table of the previous visit is displayed until the new runs are
     * fetched. Waiting for the runs response ensures the table checked below is the fresh one and will not be re-rendered under the test
     */
    const runsResponse = page.waitForResponse(
        (response) => {
            const { pathname, search } = new URL(response.url());
            return pathname === '/api/runs' && new RegExp(`filter\\[dataPassIds\\]\\[\\d*\\]=${dataPassId}(&|$)`).test(decodeURIComponent(search));
        },
        { timeout: 5000 },
    );
    await waitForNavigation(page, () => pressElement(page, `#row${dataPassId}-associatedRuns a`, true));
    expectUrlParams(page, { page: 'runs-per-data-pass', dataPassId }, ['pdpBeamType']);
    await runsResponse;
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
