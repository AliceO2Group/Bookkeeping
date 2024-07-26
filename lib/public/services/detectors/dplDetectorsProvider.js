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
import { VIRTUAL_DETECTOR_NAME } from '../../domain/enums/detectorsNames.mjs';

/**
 * Service class to fetch DPL detectors from the backend
 */
export class DplDetectorsProvider extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();
        this._all$ = new ObservableData(RemoteData.notAsked());
        this._physical$ = ObservableData.builder()
            .source(this._all$)
            .apply((remoteDetectors) => remoteDetectors.apply({
                Success: (detectors) => detectors
                    .filter(({ name }) => name && name !== VIRTUAL_DETECTOR_NAME.TST)
                    .sort((a, b) => {
                        // If a or b is glo detector, put it at the start of the list
                        if (a.name === VIRTUAL_DETECTOR_NAME.GLO) {
                            return -1;
                        }
                        if (b.name === VIRTUAL_DETECTOR_NAME.GLO) {
                            return 1;
                        }

                        // Locale compare a and b
                        return a.name.localeCompare(b.name);
                    }),
            }))
            .build();
    }

    /**
     * Return all DPL detectors observable data
     *
     * @return {ObservableData<RemoteData<DplDetector[], ApiError>>} the observable DPL detectors list
     */
    get all$() {
        if (this._isStale()) {
            this._load();
        }
        return this._all$;
    }

    /**
     * Return ordered physical (meaning actual detectors, for example excluding TST) DPL detectors list observable data
     *
     * @return {ObservableData<RemoteData<Detector[], ApiError>>} the observable physical DPL detectors list
     */
    get physical$() {
        if (this._isStale()) {
            this._load();
        }
        return this._physical$;
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
        getRemoteData('/api/dpl-detectors').then(
            ({ data: detectors }) => this._all$.setCurrent(RemoteData.success(detectors)),
            (error) => this._all$.setCurrent(RemoteData.failure(error)),
        );
    }
}

export const dplDetectorsProvider = new DplDetectorsProvider();
