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

import { switchCase } from '/js/src/index.js';
import { getRemoteData } from '../../utilities/fetch/getRemoteData.js';
import { ObservableData } from '../../utilities/ObservableData.js';
import { DetectorType, DATA_TAKING_DETECTOR_TYPES, QC_DETECTORS } from '../../domain/enums/DetectorTypes.js';

import { NonPhysicalDetector } from '../../domain/enums/detectorsNames.mjs';

import { RemoteDataProvider } from '../RemoteDataProvider.js';
const DETECTORS_EXCLUDED_FROM_QC = [NonPhysicalDetector.GLO];

/**
 * Return the physical detectors from a list of detectors
 *
 * @param {Detector[]} allDetectors the list of all detectors
 * @return {Detector[]} physical detectors
 */
const getPhysicalDetectorsFromAllDetectors = (allDetectors) => allDetectors.filter(({ type }) => type === DetectorType.PHYSICAL);

/**
 * Return the QC detectors from a list of detectors
 *
 * @param {Detector[]} allDetectors the list of all detectors
 * @return {Detector[]} QC detectors
 */
const getQcDetectorsFromAllDetectors = (allDetectors) => allDetectors
    .filter(({ type, name }) => QC_DETECTORS.includes(type) && !DETECTORS_EXCLUDED_FROM_QC.includes(name));

/**
 * Service class to fetch detectors from the backend
 */
export class DetectorsProvider extends RemoteDataProvider {
    /**
     * Constructor
     */
    constructor() {
        super();
        this._physical$ = ObservableData.builder()
            .source(this._items$)
            .apply((remoteDetectors) => remoteDetectors.apply({
                Success: getPhysicalDetectorsFromAllDetectors,
            }))
            .build();

        this._dataTaking$ = ObservableData.builder()
            .source(this._items$)
            .apply((remoteDetectors) => remoteDetectors.apply({
                Success: (detectors) => detectors.filter(({ type }) => DATA_TAKING_DETECTOR_TYPES.includes(type)),
            }))
            .build();

        this._qc$ = ObservableData.builder()
            .source(this._items$)
            .apply((remoteDetectors) => remoteDetectors.apply({
                Success: getQcDetectorsFromAllDetectors,
            }))
            .build();
    }

    /**
     * @inheritDoc
     */
    async getRemoteData() {
        const { data } = await getRemoteData('/api/detectors');
        const typeToOrderingKey = (type) => switchCase(type, {
            [DetectorType.OTHER]: 0,
            [DetectorType.VIRTUAL]: 1,
            [DetectorType.PHYSICAL]: 2,
            [DetectorType.AOT_GLO]: 3,
            [DetectorType.AOT_EVENT]: 4,
            [DetectorType.MUON_GLO]: 5,
            [DetectorType.QC_ONLY]: 6,
        });
        data.sort(({ name: name1, type: type1 }, { name: name2, type: type2 }) =>
            -(typeToOrderingKey(type1) - typeToOrderingKey(type2)) * 10 + name1.localeCompare(name2));
        return data;
    }

    /**
     * Return the list of the physical detectors
     *
     * @return {Promise<Detector[]>} the list of physical detectors
     */
    async getPhysical() {
        return getPhysicalDetectorsFromAllDetectors(await this.getItems());
    }

    /**
     * Return the list of QC detectors
     *
     * @return {Promise<Detector[]>} the list of QC detectors
     */
    async getQc() {
        return getQcDetectorsFromAllDetectors(await this.getItems());
    }

    /**
     * Return all detectors list observable data
     *
     * @return {ObservableData<RemoteData<Detector[], ApiError>>} the observable detectors list
     */
    get all$() {
        return this.items$;
    }

    /**
     * Return physical (meaning actual detectors, for example excluding TST) detectors list observable data
     *
     * @return {ObservableData<RemoteData<Detector[], ApiError>>} the observable physical detectors list
     */
    get physical$() {
        if (this._isStale()) {
            this._load();
        }
        return this._physical$;
    }

    /**
     * Return data taking (Any detector that might be used in AliECS configuration) detectors list observable data
     *
     * @return {ObservableData<RemoteData<Detector[], ApiError>>} the observable run assignable detectors list
     */
    get dataTaking$() {
        if (this._isStale()) {
            this._load();
        }
        return this._dataTaking$;
    }

    /**
     * Return physical and QC (meaning physical ones plus e.g. 'GLO') detectors list observable data
     *
     * @return {ObservableData<RemoteData<Detector[], ApiError>>} the observable physical and QC detectors list
     */
    get qc$() {
        if (this._isStale()) {
            this._load();
        }
        return this._qc$;
    }
}

export const detectorsProvider = new DetectorsProvider();
