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
import { Observable } from '/js/src/index.js';
import { ObservableData } from '../ObservableData.js';

/**
 * Class to abstract notifying from data changes
 * @template T - type of data served by data source
 */
export class DataSource extends Observable {
    /**
     * Constructor
     * @param {DataSource} [dataSource = null] optional inner data source
     */
    constructor(dataSource = null) {
        super();
        this._dataSource = dataSource;

        /**
         * @type {ObservableData<T>}
         * @private
         */
        this._observableData = new ObservableData(null);
    }

    /**
     * Fetch data
     * @return {Promise<void>} resolves once the data fetching has ended
     * @abstract
     */
    async fetch() {
        throw new Error('Abstract class');
    }

    /**
     * Return the observable remote data provided by this source
     * @return {ObservableData<T>} the observable remote data
     */
    get observableData() {
        return this._observableData;
    }
}
