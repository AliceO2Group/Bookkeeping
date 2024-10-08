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

import { Observable, RemoteData } from '/js/src/index.js';
import { getRemoteData } from '../../utilities/fetch/getRemoteData.js';
import { ObservableData } from '../../utilities/ObservableData.js';
import { DetectorType, DATA_TAKING_DETECTOR_TYPES } from '../../domain/enums/DetectorTypes.js';

import { NonPhysicalDetector } from '../../domain/enums/detectorsNames.mjs';
const DETECTORS_EXCLUDED_FROM_QC = [NonPhysicalDetector.GLO];

/**
 * Return the physical detectors from a list of detectors
 *
 * @param {Detector[]} allDetectors the list of all detectors
 * @return {Detector[]} physical detectors
 */
const getPhysicalDetectorsFromAllDetectors = (allDetectors) => allDetectors.filter(({ type }) => type === DetectorType.PHYSICAL);

/**
 * Service class to fetch detectors from the backend
 */
export class DetectorsProvider extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();
        this._allDetectors = null;

        this._all$ = ObservableData.builder()
            .initialValue(RemoteData.NotAsked())
            .apply((remoteDetectors) => remoteDetectors.apply({
                Success: (detectors) => detectors.sort(({ name: name1 }, { name: name2 }) => name1.localeCompare(name2)),
            }))
            .build();

        this._physical$ = ObservableData.builder()
            .source(this._all$)
            .apply((remoteDetectors) => remoteDetectors.apply({
                Success: getPhysicalDetectorsFromAllDetectors,
            }))
            .build();

        this._dataTaking$ = ObservableData.builder()
            .source(this._all$)
            .apply((remoteDetectors) => remoteDetectors.apply({
                Success: (detectors) => detectors.filter(({ type }) => DATA_TAKING_DETECTOR_TYPES.includes(type)),
            }))
            .build();

        this._qc$ = ObservableData.builder()
            .source(this._all$)
            .apply((remoteDetectors) => remoteDetectors.apply({
                Success: (detectors) => detectors
                    .filter(({ type, name }) => [DetectorType.PHYSICAL, DetectorType.QC].includes(type)
                        && !DETECTORS_EXCLUDED_FROM_QC.includes(name)),
            }))
            .build();
    }

    /**
     * Returns the list of all the available detectors
     *
     * @return {Promise<Detector[]>} the list of all detectors
     */
    async getAll() {
        if (!this._allDetectors) {
            const { data } = await getRemoteData('/api/detectors');
            this._allDetectors = data;
        }

        return this._allDetectors;
    }

    /**
     * Return the list of the physical detectors
     *
     * @return {Promise<Detector[]>} the list of physical detectors
     */
    async getPhysical() {
        return getPhysicalDetectorsFromAllDetectors(await this.getAll());
    }

    /**
     * Return all detectors list observable data
     *
     * @return {ObservableData<RemoteData<Detector[], ApiError>>} the observable detectors list
     */
    get all$() {
        if (this._isStale()) {
            this._load();
        }
        return this._all$;
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

    /**
     * States if the cached detectors list need to be created or updated
     *
     * @return {boolean} true if the detectors list must be refreshed
     * @private
     */
    _isStale() {
        return this._all$.getCurrent().match({
            NotAsked: () => true,
            Other: () => false,
        });
    }

    /**
     * Load all the detectors and feed the observable data
     *
     * @return {void}
     * @private
     */
    _load() {
        this._all$.setCurrent(RemoteData.loading());
        this.getAll().then(
            (detectors) => this._all$.setCurrent(RemoteData.success(detectors)),
            (error) => this._all$.setCurrent(RemoteData.failure(error)),
        );
    }
}

export const detectorsProvider = new DetectorsProvider();
