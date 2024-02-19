/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

import { Observable, RemoteData } from '/js/src/index.js';
import { getLocaleDateAndTime, getStartOfDay, MILLISECONDS_IN_ONE_DAY } from '../../../../utilities/dateUtils.js';
import { buildUrl } from '../../../../utilities/fetch/buildUrl.js';
import { getRemoteData } from '../../../../utilities/fetch/getRemoteData.js';
import {
    AliceMagnetsConfigurationSnapshotsForm,
} from '../../../../components/common/form/magnetsConfiguration/AliceMagnetsConfigurationSnapshotsForm.js';
import { detectorsProvider } from '../../../../services/detectors/detectorsProvider.js';
import { formatFullDate } from '../../../../utilities/formatting/formatFullDate.js';
import { formatPercentage } from '../../../../utilities/formatting/formatPercentage.js';
import { formatTimeAndEfficiencyLoss } from '../../../../utilities/formatting/formatTimeAndEfficiencyLoss.js';

/**
 * @typedef RcDailyMeetingTemplateFormData
 * @property {string} lhcPlans
 * @property {string} alicePlans
 * @property {string} access
 * @property {string} pendingRequests
 * @property {string} aob
 */

const SYSTEMS_AND_SERVICES_TAGS = {
    'ECS and FLP': ['ECS', 'FLP'],
    CRU: ['CRU'],
    Bookkeeping: ['Bookkeeping'],
    EOS: ['EoS'],
    'Event display': ['EventDisplay'],
    EPN: ['EPN'],
    PDP: ['PDP'],
    QC: ['QC'],
    CTP: ['CTP'],
    DCS: ['DCS'],
    LHC_IF: ['LHC_IF'],
};

const DETECTORS_TAGS = {
    FIT: ['FIT'],
    ITS: ['ITS'],
    MFT: ['MFT'],
    MCH: ['MCH'],
    MID: ['MID'],
    PHOS: ['PHOS'],
    CPV: ['CPV'],
    TOF: ['TOF'],
    TPC: ['TPC'],
    TRD: ['TRD'],
    ZDC: ['ZDC'],
};

/**
 * Log template for RC daily meeting
 */
export class RcDailyMeetingTemplate extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();

        const startOfToday = getStartOfDay().getTime();
        const dataFetchingPeriod = {
            from: startOfToday - MILLISECONDS_IN_ONE_DAY / 2,
            to: startOfToday + MILLISECONDS_IN_ONE_DAY / 2,
        };

        this._physicalDetectors$ = detectorsProvider.physical$;
        this._physicalDetectors$.bubbleTo(this);

        /**
         * @type {RemoteData<LhcFill[], ApiError>}
         * @private
         */
        this._lhcFills = RemoteData.loading();
        getRemoteData(buildUrl('/api/lhcFills/ended-within', dataFetchingPeriod)).then(
            ({ data: lhcFills }) => {
                this._lhcFills = RemoteData.success(lhcFills);
                this.notify();
            },
            (error) => {
                this._lhcFills = RemoteData.failure(error);
                this.notify();
            },
        );

        this._runsToCheck = RemoteData.loading();
        getRemoteData(buildUrl(
            '/api/runs',
            { filter: { o2end: dataFetchingPeriod } },
        )).then(
            ({ data: runs }) => {
                this._runsToCheck = RemoteData.success(runs);
                this.notify();
            },
            (error) => {
                this._runsToCheck = RemoteData.failure(error);
                this.notify();
            },
        );

        this._systemsLogs = RemoteData.loading();
        this._getLogsMappedByTagsClusters(SYSTEMS_AND_SERVICES_TAGS, dataFetchingPeriod).then(
            (logs) => {
                this._systemsLogs = RemoteData.success(logs);
            },
            (error) => {
                this._systemsLogs = RemoteData.failure(error);
            },
        );

        this._detectorsLogs = RemoteData.loading();
        this._getLogsMappedByTagsClusters(DETECTORS_TAGS, dataFetchingPeriod).then(
            (logs) => {
                this._detectorsLogs = RemoteData.success(logs);
            },
            (error) => {
                this._detectorsLogs = RemoteData.failure(error);
            },
        );

        /**
         * @type {Partial<RcDailyMeetingTemplateFormData>}
         */
        this.formData = {
            lhcPlans: '',
        };

        this._magnetsConfigurationModel = new AliceMagnetsConfigurationSnapshotsForm();
        this._magnetsConfigurationModel.bubbleTo(this);
    }

    /**
     * States if the form is valid
     *
     * @return {boolean} true if the form is valid
     */
    get isValid() {
        return this._lhcFills.match({ Success: () => true, Other: () => false })
            && this._runsToCheck.match({ Success: () => true, Other: () => false })
            && this._systemsLogs.match({ Success: () => true, Other: () => false })
            && this._detectorsLogs.match({ Success: () => true, Other: () => false });
    }

    /**
     * Patch the template form data
     *
     * @param {Partial<RcDailyMeetingTemplateFormData>} patch the patch to apply
     * @return {void}
     */
    patchFormData(patch) {
        this.formData = {
            ...this.formData,
            ...patch,
        };

        this.notify();
    }

    /**
     * Return the list of all physical detectors
     *
     * @return {RemoteData<Detector[], ApiError>} the detectors
     */
    get physicalDetectors() {
        return this._physicalDetectors$.getCurrent();
    }

    /**
     * Return the list of LHC fills that ended between noon last day and noon today
     *
     * @return {RemoteData<LhcFill[], ApiError>} the remote LHC fills
     */
    get lhcFills() {
        return this._lhcFills;
    }

    /**
     * Returns the list of runs that ended between noon last day and noon today
     *
     * @return {RemoteData<Run[], ApiError>} the remote runs
     */
    get runsToCheck() {
        return this._runsToCheck;
    }

    /**
     * Return the list of system logs mapped by tags
     *
     * @return {RemoteData<Map<string, Log[]>, ApiError>} the system logs
     */
    get systemLogs() {
        return this._systemsLogs;
    }

    /**
     * Return the list of detectors logs mapped by tags
     *
     * @return {RemoteData<Map<string, Log[]>, ApiError>} the detectors logs
     */
    get detectorsLogs() {
        return this._detectorsLogs;
    }

    /**
     * Return the model for magnets configuration form
     *
     * @return {AliceMagnetsConfigurationSnapshotsFormModel} the model
     */
    get magnetsConfigurationModel() {
        return this._magnetsConfigurationModel;
    }

    /**
     * Returns the title of the log to create
     */
    get title() {
        return `RC Daily Meeting Minutes ${getLocaleDateAndTime(Date.now()).date}`;
    }

    /**
     * Returns the text of the log to create
     */
    get text() {
        const textParts = [];
        textParts.push([
            '# RC Daily Meeting Minutes',
            `Date: ${formatFullDate(new Date())}`,
        ].join('\n'));

        textParts.push('## LHC');
        const lhcFills = this._lhcFills.match({
            Success: (lhcFills) => lhcFills,
            Other: () => [],
        });
        if (lhcFills.length) {
            textParts.push('### Last 24h');
            for (const lhcFill of lhcFills) {
                textParts.push([
                    `Fill ${lhcFill.fillNumber} (${lhcFill.fillingSchemeName})`,
                    `* Beam type: ${lhcFill.beamType}`,
                    `* Stable beam start: ${lhcFill.stableBeamsStart ?? '-'}`,
                    `* Stable beam end: ${lhcFill.stableBeamsEnd ?? '-'}`,
                    `* Duration: ${lhcFill.stableBeamsDuration ?? '-'}`,
                    `* Efficiency: ${formatPercentage(lhcFill.statistics?.efficiency)}`,
                    `* Time to first run: ${formatTimeAndEfficiencyLoss(
                        lhcFill.statistics?.timeLossAtStart,
                        lhcFill.statistics?.efficiencyLossAtStart,
                    )}`,
                ].join('\n'));
            }
        } else {
            textParts.push(['### Last 24h', '-'].join('\n'));
        }
        textParts.push([
            '### Plans',
            this.formData.lhcPlans || '-',
        ].join('\n'));

        textParts.push('## ALICE');
        textParts.push('### Last 24h');
        textParts.push([
            '#### Magnets',
            this.magnetsConfigurationModel.snapshots
                .filter(({ timestamp }) => timestamp !== undefined)
                .map(({ timestamp, magnetsConfiguration: { dipole, solenoid } }) => {
                    const { date, time } = getLocaleDateAndTime(timestamp);
                    return `[${date}, ${time}] L3 = ${solenoid || '-'}, Dipole = ${dipole || '-'}`;
                })
                .join('\n') || '-',
        ].join('\n'));

        textParts.push([
            '### Plans',
            this.formData.alicePlans || '-',
        ].join('\n'));

        textParts.push([
            '## Runs to be checked',
            this.physicalDetectors.match({
                Success: (detectors) => {
                    /**
                     * Format the given cells to be used as Markdown table row
                     * @param {string[]} cells the cells to format
                     * @return {string} the row
                     */
                    const formatRow = (cells) => cells.join(' | ');
                    const header = ['Runs', ...detectors.map(({ name }) => name)];
                    const rows = [header, header.map((_) => '---')];
                    this._runsToCheck.match({
                        // eslint-disable-next-line valid-jsdoc
                        /**
                         * @param {Run[]} runs the runs
                         * @constructor
                         */
                        Success: (runs) => {
                            for (const { runNumber, detectorsQualities } of runs) {
                                const qualitiesMap = new Map(detectors.map(({ name }) => [name, null]));
                                for (const { name, quality } of detectorsQualities) {
                                    qualitiesMap.set(name, quality);
                                }
                                rows.push([runNumber, ...qualitiesMap.values()]);
                            }
                        },
                        Other: () => [],
                    });

                    return rows
                        .map((row) => formatRow(row))
                        .join('\n');
                },
                Other: () => '-',
            }),
        ].join('\n'));

        textParts.push([
            '## Access',
            this.formData.access || '-',
        ].join('\n'));

        /**
         * Format remote logs cluster to be included in log markdown
         *
         * @param {Map<string, Log[]>} logsClusters the logs mapped by the tags clusters
         * @return {string} the formatted logs
         */
        const formatRemoteLogsClusters = (logsClusters) => [
            ...logsClusters.match({
                Success: (logsClusters) => logsClusters,
                Other: () => new Map(),
            }).entries(),
        ]
            .map(([label, logs]) => [
                `* ${label}: `,
                ...logs.map(({ id, title }) => `  * [${title}](${buildUrl(window.location.origin, { page: 'log-detail', id })})`),
            ].join('\n'))
            .join('\n');

        textParts.push([
            '## Central systems/services',
            formatRemoteLogsClusters(this._systemsLogs),
        ].join('\n'));

        textParts.push([
            '## Detectors',
            formatRemoteLogsClusters(this._detectorsLogs),
        ].join('\n'));

        textParts.push([
            '## Pending request',
            this.formData.pendingRequests || '-',
        ].join('\n'));

        textParts.push([
            '## AOB',
            this.formData.aob || '-',
        ].join('\n'));

        return textParts.join('\n\n');
    }

    /**
     * Fetch and prepare the list of logs created with tags in given tags groups
     *
     * @param {Object} tagsClusters object representing tags cluster for which logs must be fetched (properties are used as cluster label)
     * @param {Period} dataFetchingPeriod the period on which data should be fetched
     * @return {Promise<Map<string, Log[]>>} the logs map
     * @private
     */
    async _getLogsMappedByTagsClusters(tagsClusters, dataFetchingPeriod) {
        const { data: logs } = await getRemoteData(buildUrl(
            '/api/logs',
            {
                filter: {
                    tags: {
                        operation: 'or',
                        values: Object.values(tagsClusters).flat(),
                    },
                    created: dataFetchingPeriod,
                    rootOnly: 'true',
                },
            },
        ));

        // Prepare a map indexing the system&service label to its list of tags containing one of the desired tags
        const logsMap = new Map(Object.keys(tagsClusters).map((label) => [label, []]));
        for (const log of logs) {
            const tags = log.tags.map(({ text }) => text);
            // For each of the system&service, if the log contains at least one of the desired tags, push it to into the map
            for (const [systemLabel, systemTags] of Object.entries(tagsClusters)) {
                if (tags.some((tag) => systemTags.includes(tag))) {
                    logsMap.get(systemLabel).push(log);
                }
            }
        }
        return logsMap;
    }
}
