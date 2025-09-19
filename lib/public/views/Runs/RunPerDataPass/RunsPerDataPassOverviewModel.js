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
import { buildUrl, RemoteData } from '/js/src/index.js';
import { ObservableData } from '../../../utilities/ObservableData.js';
import { getRemoteDataSlice } from '../../../utilities/fetch/getRemoteDataSlice.js';
import { getRemoteData } from '../../../utilities/fetch/getRemoteData.js';
import { detectorsProvider } from '../../../services/detectors/detectorsProvider.js';
import { FixedPdpBeamTypeRunsOverviewModel } from '../Overview/FixedPdpBeamTypeRunsOverviewModel.js';
import { jsonPatch } from '../../../utilities/fetch/jsonPatch.js';
import { jsonPut } from '../../../utilities/fetch/jsonPut.js';
import { SkimmingStage } from '../../../domain/enums/SkimmingStage.js';
import { NumericalComparisonFilterModel } from '../../../components/Filters/common/filters/NumericalComparisonFilterModel.js';
import { jsonFetch } from '../../../utilities/fetch/jsonFetch.js';
import { mergeRemoteData } from '../../../utilities/mergeRemoteData.js';
import { DetectorType } from '../../../domain/enums/DetectorTypes.js';

const ALL_CPASS_PRODUCTIONS_REGEX = /cpass\d+/;
const DETECTOR_NAMES_NOT_IN_CPASSES = ['EVS'];

/**
 * Runs Per Data Pass overview model
 */
export class RunsPerDataPassOverviewModel extends FixedPdpBeamTypeRunsOverviewModel {
    /**
     * Constructor
     * @param {Model} model global model
     */
    constructor(model) {
        super(model);
        this._dataPass$ = new ObservableData(RemoteData.notAsked());
        this._dataPass$.bubbleTo(this);

        this._detectors$ = ObservableData
            .builder()
            .sources([detectorsProvider.qc$, this._dataPass$])
            .apply((remoteDataList) => mergeRemoteData(remoteDataList)
                .apply({ Success: ([detectors, dataPass]) => ALL_CPASS_PRODUCTIONS_REGEX.test(dataPass.name)
                    ? detectors.filter(({ name, type }) => type !== DetectorType.AOT_GLO || DETECTOR_NAMES_NOT_IN_CPASSES.includes(name))
                    : detectors,
                }))
            .build();

        this._detectors$.bubbleTo(this);
        this.registerDetectorsNotBadFractionFilterModels(this._detectors$);
        this.registerObervablesQcSummaryDependesOn([this._detectors$]);

        this._gaqSummary$ = new ObservableData(RemoteData.notAsked());
        this._gaqSummary$.bubbleTo(this);

        this._markAsSkimmableRequestResult$ = new ObservableData(RemoteData.notAsked());
        this._markAsSkimmableRequestResult$.bubbleTo(this);

        this._skimmableRuns$ = new ObservableData(RemoteData.notAsked());
        this._skimmableRuns$.bubbleTo(this);

        this._filteringModel.put('gaq[notBadFraction]', new NumericalComparisonFilterModel({
            scale: 0.01,
            integer: false,
        }));

        this._freezeOrUnfreezeActionState$ = new ObservableData(RemoteData.notAsked());
        this._freezeOrUnfreezeActionState$.bubbleTo(this);

        this._discardAllQcFlagsActionState$ = new ObservableData(RemoteData.notAsked());
        this._discardAllQcFlagsActionState$.bubbleTo(this);
    }

    /**
     * Change ready for skimming flag for given run
     *
     * @param {{ runNumber: number, readyForSkimming: boolean }} skimmableRun run number with ready for skimming flag
     * @return {Promise<void>} resolves once request is handled
     */
    async changeReadyForSkimmingFlagForRun(skimmableRun) {
        this._skimmableRuns$.getCurrent().match({
            Success: async (currentSkimmableRuns) => {
                this._skimmableRuns$.setCurrent(RemoteData.loading());
                const { runNumber, readyForSkimming } = skimmableRun;
                try {
                    const { data: skimmableRuns } = await jsonPut(
                        buildUrl('/api/dataPasses/skimming/runs', { dataPassId: this._dataPassId }),
                        { data: [{ runNumber, readyForSkimming }] },
                    );
                    const newRunToReadyForSkimmingFlag = Object.fromEntries(skimmableRuns
                        .map(({ runNumber, readyForSkimming }) => [runNumber, readyForSkimming]));

                    this._skimmableRuns$.setCurrent(RemoteData.success({ ...currentSkimmableRuns, ...newRunToReadyForSkimmingFlag }));
                } catch (error) {
                    this._skimmableRuns$.setCurrent(RemoteData.failure(error));
                }
            },
            Other: () => {
                this._skimmableRuns$.setCurrent(RemoteData.failure([
                    {
                        title: 'Missing data',
                        detail: 'Need to successfully fetch skimmable runs in order to update them',
                    },
                ]));
            },
        });
    }

    /**
     * @inheritdoc
     */
    async load() {
        if (!this._dataPassId) {
            return;
        }

        this._fetchGaqSummary();
        await this._fetchDataPass().then(() =>
            this._dataPass$.getCurrent().match({
                Success: ({ skimmingStage, pdpBeamTypes }) => {
                    if (skimmingStage === SkimmingStage.SKIMMABLE) {
                        this._fetchSkimmableRuns();
                    }
                    this.setPdpBeamTypes(pdpBeamTypes);
                },
                Other: () => null,
            }));
        super.load();
    }

    /**
     * @inheritdoc
     */
    getRootEndpoint() {
        const gaqNotBadFilter = this._filteringModel.get('gaq[notBadFraction]');
        const filter = { dataPassIds: [this._dataPassId] };
        if (!gaqNotBadFilter.isEmpty) {
            filter.gaq = {
                mcReproducibleAsNotBad: this._mcReproducibleAsNotBad,
            };
        }

        return buildUrl(super.getRootEndpoint(), { filter });
    }

    /**
     * @inheritdoc
     */
    resetFiltering(fetch = true) {
        super.resetFiltering(fetch);
    }

    /**
     * Freeze the current data pass
     *
     * @return {Promise<void>} Resolves once the data pass is frozen
     */
    async freezeDataPass() {
        this._freezeOrUnfreezeActionState$.setCurrent(RemoteData.loading());
        try {
            await jsonPatch(
                buildUrl('/api/dataPasses/freeze', { dataPassId: this._dataPassId }),
                {},
            );
            this._freezeOrUnfreezeActionState$.setCurrent(RemoteData.success(null));
            await this.load();
        } catch (error) {
            this._freezeOrUnfreezeActionState$.setCurrent(RemoteData.failure(error));
        }
    }

    /**
     * Unfreeze the current data pass
     *
     * @return {Promise<void>} Resolves once the data pass is unfrozen
     */
    async unfreezeDataPass() {
        this._freezeOrUnfreezeActionState$.setCurrent(RemoteData.loading());
        try {
            await jsonPatch(
                buildUrl('/api/dataPasses/unfreeze', { dataPassId: this._dataPassId }),
                {},
            );
            this._freezeOrUnfreezeActionState$.setCurrent(RemoteData.success(null));
            await this.load();
        } catch (error) {
            this._freezeOrUnfreezeActionState$.setCurrent(RemoteData.failure(error));
        }
    }

    /**
     * Return the state of the freeze/unfreeze action
     *
     * @return {RemoteData<null, ApiError>} the freeze/unfreeze action state
     */
    get freezeOrUnfreezeActionState() {
        return this._freezeOrUnfreezeActionState$.getCurrent();
    }

    /**
     * Discard all the QC for the data-pass
     *
     * @return {Promise<void>} resolves once flags has been deleted
     */
    async discardAllQcFlags() {
        this._discardAllQcFlagsActionState$.setCurrent(RemoteData.loading());
        try {
            await jsonFetch(
                buildUrl('/api/qcFlags/perDataPass', { dataPassId: this._dataPassId }),
                { method: 'DELETE' },
            );
            this._discardAllQcFlagsActionState$.setCurrent(RemoteData.success(null));
            await this.load();
        } catch (error) {
            this._discardAllQcFlagsActionState$.setCurrent(RemoteData.failure(error));
        }
    }

    /**
     * Return the state of the discard all QC flags action
     *
     * @return {RemoteData<null, ApiError>} the QC flags action state
     */
    get discardAllQcFlagsActionState() {
        return this._discardAllQcFlagsActionState$.getCurrent();
    }

    /**
     * Send request to mark current data pass as skimmable
     * @return {Promise<void>} resolved once request is handled
     */
    async markDataPassAsSkimmable() {
        this._markAsSkimmableRequestResult$.setCurrent(RemoteData.loading());
        try {
            await jsonPatch(buildUrl('/api/dataPasses/skimming/markSkimmable', { dataPassId: this._dataPassId }));
            this._markAsSkimmableRequestResult$.setCurrent(RemoteData.success());
            await this._fetchDataPass();
            await this._fetchSkimmableRuns();
        } catch (error) {
            this._markAsSkimmableRequestResult$.setCurrent(RemoteData.failure(error));
        }
    }

    /**
     * Result of request for marking current data pass as skimmable
     * @return {RemoteData} remote data
     */
    get markAsSkimmableRequestResult() {
        return this._markAsSkimmableRequestResult$.getCurrent();
    }

    /**
     * Get skimmable runs
     */
    get skimmableRuns() {
        return this._skimmableRuns$.getCurrent();
    }

    /**
     * @inheritdoc
     */
    reset() {
        super.reset();
        this._markAsSkimmableRequestResult$?.setCurrent(RemoteData.NotAsked());
    }

    /**
     * Set id of data pass which runs are to be fetched
     * @param {number} dataPassId id of Data Pass
     */
    set dataPassId(dataPassId) {
        this._dataPassId = dataPassId;
    }

    /**
     * Get current data pass which runs are fetched
     */
    get dataPass() {
        return this._dataPass$.getCurrent();
    }

    /**
     * Get all detectors
     * @return {RemoteData<DplDetector[]>} detectors
     */
    get detectors() {
        return this._detectors$.getCurrent();
    }

    /**
     * GAQ summary getter
     * @return {RemoteData<GaqSummary>} GAQ summary
     */
    get gaqSummary() {
        return this._gaqSummary$.getCurrent();
    }

    /**
     * Data pass id getter
     * @return {number} current data pass id
     */
    get dataPassId() {
        return this._dataPassId;
    }

    /**
     * Fetch data pass data which runs are fetched
     * @return {Promise<void>} promise
     */
    async _fetchDataPass() {
        this._dataPass$.setCurrent(RemoteData.loading());
        try {
            const { items: [dataPass] = [] } = await getRemoteDataSlice(`/api/dataPasses?filter[ids][]=${this._dataPassId}`);
            this._dataPass$.setCurrent(RemoteData.success(dataPass));
        } catch (error) {
            this._dataPass$.setCurrent(RemoteData.failure(error));
        }
    }

    /**
     * Fetch GAQ summary for given data pass
     * @return {Promise<void>} resolves once data are fetched
     */
    async _fetchGaqSummary() {
        this._gaqSummary$.setCurrent(RemoteData.loading());
        try {
            const { data: gaqSummary } = await getRemoteData(buildUrl('/api/qcFlags/summary/gaq', {
                dataPassId: this._dataPassId,
                mcReproducibleAsNotBad: this._mcReproducibleAsNotBad,
            }));
            this._gaqSummary$.setCurrent(RemoteData.success(gaqSummary));
        } catch (error) {
            this._gaqSummary$.setCurrent(RemoteData.failure(error));
        }
    }

    /**
     * Fetch skimmable runs for given data pass
     * @return {Promise<void>} resolves once data are fetched
     */
    async _fetchSkimmableRuns() {
        this._skimmableRuns$.setCurrent(RemoteData.loading());
        try {
            const { data: skimmableRuns } = await getRemoteData(buildUrl('/api/dataPasses/skimming/runs', { dataPassId: this._dataPassId }));
            const runToReadyForSkimmingFlag = Object.fromEntries(skimmableRuns
                .map(({ runNumber, readyForSkimming }) => [runNumber, readyForSkimming]));
            this._skimmableRuns$.setCurrent(RemoteData.success(runToReadyForSkimmingFlag));
        } catch (error) {
            this._skimmableRuns$.setCurrent(RemoteData.failure(error));
        }
    }

    /**
     * @inheritdoc
     */
    get qcSummaryScope() {
        return { dataPassId: this.dataPassId };
    }
}
