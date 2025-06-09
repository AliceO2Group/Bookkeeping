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
import { getRemoteData } from '../utilities/fetch/getRemoteData.js';
import { ObservableData } from '../utilities/ObservableData.js';
import { RemoteData } from '/js/src/index.js';

/**
 * Service providing global app configuration
 */
class ConfigurationService {
    /**
     * Configuration
     */
    constructor() {
        this._configuration$ = new ObservableData(RemoteData.notAsked());
    }

    /**
     * Load the app configuration
     *
     * @return {void}
     */
    load() {
        this._configuration$.setCurrent(RemoteData.loading());
        getRemoteData('/api/configuration').then(
            ({ data: configuration }) => this._configuration$.setCurrent(RemoteData.success(configuration)),
            (error) => this._configuration$.setCurrent(RemoteData.failure(error)),
        );
    }

    /**
     * Return the configuration as observable data
     *
     * @return {ObservableData<RemoteData<AppConfiguration, ApiError>>} the configuration
     */
    get configuration$() {
        return this._configuration$;
    }
}

export const configurationService = new ConfigurationService();
