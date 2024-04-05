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

const TST_DETECTOR_NAME = 'TST';

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
                Success: (detectors) => detectors.filter(({ name }) => name !== TST_DETECTOR_NAME),
            }))
            .build();
        this._dpl$ = new ObservableData(RemoteData.notAsked());
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
     * Return all DPL detectors
     *
     * @return {ObservableData<RemoteData<DplDetector[], ApiError>>} the observable DPL detectors list
     */
    get dpl$() {
        if (this._isStale()) {
            this._load();
        }
        return this._dpl$;
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
        }) || this._dpl$.getCurrent().match({
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
        getRemoteData('/api/detectors').then(
            ({ data: detectors }) => this._all$.setCurrent(RemoteData.success(detectors)),
            (error) => this._all$.setCurrent(RemoteData.failure(error)),
        );

        this._dpl$.setCurrent(RemoteData.loading());
        getRemoteData('/api/dpl-detectors').then(
            ({ data: detectors }) => this._dpl$.setCurrent(RemoteData.success(detectors)),
            (error) => this._dpl$.setCurrent(RemoteData.failure(error)),
        );
    }
}

export const detectorsProvider = new DetectorsProvider();
