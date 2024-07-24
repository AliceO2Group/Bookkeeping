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
import { DetectorType } from '../../domain/enums/DetectorTypes.mjs';

/**
 * Return the physical detectors from a list of detectors
 *
 * @param {Detector[]} detectors the list of all detectors
 * @return {Detector[]} physical detectors
 */
const getPhysicalDetectorsFromAllDetectors = (detectors) => detectors.filter(({ type }) => type === DetectorType.Physical);

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

        this._all$ = new ObservableData(RemoteData.notAsked());
        this._physical$ = ObservableData.builder()
            .source(this._all$)
            .apply((remoteDetectors) => remoteDetectors.apply({
                Success: getPhysicalDetectorsFromAllDetectors,
            }))
            .build();

        this._runAssignable$ = ObservableData.builder()
            .source(this._all$)
            .apply((remoteDetectors) => remoteDetectors.apply({
                Success: (detectors) => detectors.filter(({ type }) => [DetectorType.Physical, DetectorType.AbstractForRuns].includes(type)),
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
     * Return run assignable (meaning physical ones plus e.g. 'TST') detectors list obervable data
     *
     * @return {ObservableData<RemoteData<Detector[], ApiError>>} the observable run assignable detectors list
     */
    get runAssignable$() {
        if (this._isStale()) {
            this._load();
        }
        return this._runAssignable$;
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
