/**
 * Adapt Run entity to http api
 *
 * @param {Run} run to be adjusted
 * @returns {Object} run
 */
exports.runToHttpView = (run) => {
    const { lhcPeriod } = run;
    return {
        ...run,
        lhcPeriod: lhcPeriod?.name,
    };
};
