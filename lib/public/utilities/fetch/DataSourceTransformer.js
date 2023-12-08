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
import { RemoteDataSource } from './RemoteDataSource.js';
import { ObservableData } from '../ObservableData.js';

/**
 * Class to abstract notifying from data changes
 * @template U, V
 */
export class DataSourceTransfomer extends RemoteDataSource {
    /**
     * Constructor
     * @param {DataSource<U>} [dataSource] data source
     * @param {Function<U, V>} [dataTransformer = null] function to transform data from inner data source
     */
    constructor(dataSource, dataTransformer) {
        super();
        this._dataSource = dataSource;
        this._observableData = new ObservableData();
        this._dataTransformer = dataTransformer;

        this._dataSource.observableData.observe(() => {
            this._observableData.current = this._dataTransformer(this._dataSource.observableData.current);
        });
    }

    /**
     * Return the observable remote data provided by this source
     * @return {ObservableData<V>} the observable remote data
     */
    get observableData() {
        return this._observableData;
    }
}
