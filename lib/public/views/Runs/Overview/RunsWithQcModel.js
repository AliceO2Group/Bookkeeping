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
import { NumericalComparisonFilterModel } from '../../../components/Filters/common/filters/NumericalComparisonFilterModel.js';
import { RunDetectorsSelectionModel } from '../RunDetectorsSelectionModel.js';
import { getRemoteData } from '../../../utilities/fetch/getRemoteData.js';
import { RunsOverviewModel } from './RunsOverviewModel.js';
import { ObservableData } from '../../../utilities/ObservableData.js';
import { DetectorType } from '../../../domain/enums/DetectorTypes.js';
import { mergeRemoteData } from '../../../utilities/mergeRemoteData.js';

/**
 * Merge QC summaries
 *
 * @param {QcSummary[]} qcSummaries list of QC summaries
 * @return {QcSummary} QC summary
 */
const mergeQcSummaries = (qcSummaries) => qcSummaries.reduce((acc, qcSummary) => {
    for (const [runNumber, runQcSummary] of Object.entries(qcSummary)) {
        acc[runNumber] = { ...acc[runNumber], ...runQcSummary };
    }
    return acc;
}, {});

/**
 * RunsWithQcModel
 *
 * Runs overview model which stores common information for all RCT runs overviews pages
 */
export class RunsWithQcModel extends RunsOverviewModel {
    /**
     * Constructor
     * @param {Model} model global model
     */
    constructor(model) {
        super(model);

        this._mcReproducibleAsNotBad = false;

        this._runDetectorsSelectionModel = new RunDetectorsSelectionModel();
        this._runDetectorsSelectionModel.bubbleTo(this);

        this._qcSummary$ = new ObservableData(RemoteData.notAsked());
        this._qcSummary$.bubbleTo(this);

        this.patchDisplayOptions({
            horizontalScrollEnabled: true,
            verticalScrollEnabled: true,
            freezeFirstColumn: true,
        });
    }

    /**
     * @inheritdoc
     */
    getRootEndpoint() {
        const filter = {};
        filter.detectorsQc = {
            mcReproducibleAsNotBad: this._mcReproducibleAsNotBad,
        };

        return buildUrl(super.getRootEndpoint(), { filter });
    }

    /**
     * Set mcReproducibleAsNotBad
     *
     * @param {boolean} mcReproducibleAsNotBad new value
     * @return {void}
     */
    setMcReproducibleAsNotBad(mcReproducibleAsNotBad) {
        this._mcReproducibleAsNotBad = mcReproducibleAsNotBad;
        this.load();
    }

    /**
     * Get mcReproducibleAsNotBad
     *
     * @return {boolean} mcReproducibleAsNotBad
     */
    get mcReproducibleAsNotBad() {
        return this._mcReproducibleAsNotBad;
    }

    /**
     * Returns the run detectors selection model
     *
     * @return {RunDetectorsSelectionModel} selection model
     */
    get runDetectorsSelectionModel() {
        return this._runDetectorsSelectionModel;
    }

    /**
     * @inheritdoc
     */
    async load() {
        this._runDetectorsSelectionModel.reset();
        this._fetchQcSummary();
        super.load();
    }

    /**
     * Register not-bad fraction detectors filtering model
     *
     * @param {ObservableData<RemoteData<Detector>>} detectors$ detectors remote data observable
     */
    registerDetectorsNotBadFractionFilterModels(detectors$) {
        detectors$.observe((observableData) => observableData.getCurrent().apply({
            Success: (detectors) => detectors.forEach(({ id }) => {
                this._filteringModel.put(`detectorsQc[_${id}][notBadFraction]`, new NumericalComparisonFilterModel({
                    scale: 0.01,
                    integer: false,
                }));
            }),
        }));
    }

    /**
     * Register obervables data, which QC flags fetching operation success dependes on
     *
     * @param {ObservableData<RemoteData>[]} observables obervable data list
     */
    registerObervablesQcSummaryDependesOn(observables) {
        this._observablesQcFlagsSummaryDepndsOn$ = ObservableData
            .builder()
            .sources(observables)
            .apply((remoteDataList) => mergeRemoteData(remoteDataList))
            .build();

        this._observablesQcFlagsSummaryDepndsOn$
            .observe((observableData) => observableData.getCurrent().apply({ Success: () => this._fetchQcSummary() }));
    }

    /**
     * Defines API filtering params to fetch QC summary for one of: a data pass, simulation pass, LHC period
     */
    qcSummaryScope() {
        throw Error('Method not implemented');
    }

    /**
     * Return detectors which a model uses
     *
     * @returns {RemoteData<Detector[]>} remote data list of detectors
     */
    get detectors() {
        throw Error('Method not implemented');
    }

    /**
     * Fetch QC summaries for given scope
     *
     * @return {Promise<void>} promise
     */
    async _fetchQcSummary() {
        mergeRemoteData([this.detectors, this._observablesQcFlagsSummaryDepndsOn$.getCurrent()]).match({
            Success: async ([detectors]) => {
                this._qcSummary$.setCurrent(RemoteData.loading());
                try {
                    const { data: qcSummary1 } = await getRemoteData(buildUrl('/api/qcFlags/summary', {
                        ...this.qcSummaryScope,
                        detectorIds: detectors
                            .filter(({ type }) => type === DetectorType.PHYSICAL)
                            .map(({ id }) => id).join(','),
                        mcReproducibleAsNotBad: this._mcReproducibleAsNotBad,
                    }));

                    const { data: qcSummary2 } = await getRemoteData(buildUrl('/api/qcFlags/summary', {
                        ...this.qcSummaryScope,
                        detectorIds: detectors
                            .filter(({ type }) => [DetectorType.AOT_GLO, DetectorType.AOT_EVENT, DetectorType.MUON_GLO].includes(type))
                            .map(({ id }) => id).join(','),
                        filter: {
                            createdBy: {
                                names: 'Anonymous',
                                operator: 'none',
                            },
                        },
                        mcReproducibleAsNotBad: this._mcReproducibleAsNotBad,
                    }));
                    this._qcSummary$.setCurrent(RemoteData.success(mergeQcSummaries([qcSummary1, qcSummary2])));
                } catch (error) {
                    this._qcSummary$.setCurrent(RemoteData.failure(error));
                }
            },
            Other: () => null,
        });
    }

    /**
     * QC summary getter
     *
     * @return {RemoteData<QcSummary>} QC summary
     */
    get qcSummary() {
        return this._qcSummary$.getCurrent();
    }
}
