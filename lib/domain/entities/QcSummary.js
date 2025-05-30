/**
 * @typedef RunDetectorQcSummary
 *
 * @property {number} badEffectiveRunCoverage - fraction of run's data, marked explicitly with bad QC flag
 * @property {number} explicitlyNotBadEffectiveRunCoverage - fraction of run's data, marked explicitly with good QC flag
 * @property {boolean} mcReproducible - if true states that some Limited Acceptance MC Reproducible flag was assigned
 * @property {number} missingVerificationsCount - number of QC flags that are unverified and have not been discarded
 * @property {number|null} undefinedQualityPeriodsCount - number of periods which a flag is not assigned for
 */

/**
 * @typedef {Object.<number, RunDetectorQcSummary>} RunQcSummary
 * detectorId mapping to RunDetectorQcSummary
 */

/**
 * @typedef {Object.<number, RunQcSummary>} QcSummary
 * runNumber mapping to RunQcSummary
 */

/**
 * @typedef GaqRunSummary
 *
 * @property {number} badEffectiveRunCoverage - fraction of run's aggregated quality interpreted as bad
 * @property {number} explicitlyNotBadEffectiveRunCoverage - fraction of run's aggregated quality interpreted as not-bad
 * @property {boolean} mcReproducible - if true states that some of periods have aggregated quality 'Mc Reproducible'
 * @property {number} missingVerificationsCount - number of QC flags that are unverified and have not been discarded
 * @property {number} undefinedQualityPeriodsCount - number of periods without assigned flag
 */

/**
 * @typedef {Object.<number, GaqRunSummary>} GaqSummary
 * runNumber mapping to GaqRunSummary
 */
