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

import { buildUrl } from '/js/src/index.js';
import { NumericalComparisonFilterModel } from '../../../components/Filters/common/filters/NumericalComparisonFilterModel.js';
import { RunDetectorsSelectionModel } from '../RunDetectorsSelectionModel.js';
import { RunsOverviewModel } from './RunsOverviewModel.js';
import { runsActiveColumns as baseDataExportConfiguration } from '../ActiveColumns/runsActiveColumns.js';
import { DataExportTypes } from '../../../domain/enums/DataExportTypes.js';

/**
 * Creates export configuration for runs' QC flags
 *
 * @param {Detector[]} detectors detectors list
 * @return {DataExportConfiguration} export configuration for runs' QC flags
 */
const qcFlagsExportConfigurationFactory = (detectors) => Object.fromEntries(detectors.map(({ id: detectorId, name: detectorName }) =>
    [
        detectorName,
        {
            exportFormat: {
                [DataExportTypes.JSON]: (_, run) => run.qcFlags?.[detectorId],
                [DataExportTypes.CSV]: (_, { qcFlags, qcTimeStart, qcTimeEnd }) =>
                    qcFlags?.[detectorId]?.map(({ flagType, from, to }) =>
                        `${flagType.name} (from: ${from ?? qcTimeStart} to: ${to ?? qcTimeEnd})`).join(' | ') ?? '',
            },
        },
    ]));

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

        return buildUrl(super.getRootEndpoint(), { filter, include: { effectiveQcFlags: true } });
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
        super.load();
    }

    /**
     * Register not-bad fraction detectors filtering model
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
     * Register detectors for QC flags data export
     * @param {ObservableData<RemoteData<Detector>>} detectors$ detectors remote data observable
     */
    registerDetectorsForQcFlagsDataExport(detectors$) {
        detectors$.observe((observableData) => observableData.getCurrent().apply({
            Success: (detectors) => {
                this._exportModel.setDataExportConfiguration({
                    ...baseDataExportConfiguration,
                    ...qcFlagsExportConfigurationFactory(detectors),
                });
            },
            Other: () => null,
        }));
    }
}
