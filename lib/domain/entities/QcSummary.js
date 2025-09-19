/**
 * @typedef MinifiedQcSummaryFlag
 *
 * @property {number} id - QC flag identifier
 * @property {string} comment - QC flag comment
 * @property {MinifiedQcFlagType} flagType - flag type
 */

/**
 * @typedef RunDetectorQcSummary
 *
 * @property {number} badEffectiveRunCoverage - fraction of run's data, marked explicitly with bad QC flag
 * @property {number} explicitlyNotBadEffectiveRunCoverage - fraction of run's data, marked explicitly with good QC flag
 * @property {boolean} mcReproducible - if true states that some Limited Acceptance MC Reproducible flag was assigned
 * @property {number} missingVerificationsCount - number of QC flags that are unverified and have not been discarded
 * @property {MinifiedQcSummaryFlag[]} minfiedFlags - flag with only necessary properties for QC summary display
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
 * @property {number} undefinedQualityPeriodsCount - total number of GAQ periods (continous segments) with no QC flag assigned,
 *                                                   each period is counted as many times as there are detectors without flag
 *                                                   in given GAQ periods
 */

/**
 * @typedef {Object.<number, GaqRunSummary>} GaqSummary
 * runNumber mapping to GaqRunSummary
 */
