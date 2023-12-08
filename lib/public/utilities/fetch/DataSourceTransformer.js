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
import { ObservableData } from '../ObservableData.js';
import { DataSource } from '../DataSource.js';

/**
 * Class to abstract notifying from data transformation
 * @template U, V
 */
export class DataSourceTransfomer extends DataSource {
    /**
     * Constructor
     * @param {Function<U, V>} [dataTransformer] function to transform data from inner data source
     */
    constructor(dataTransformer) {
        super();

        /**
         * @type {ObservableData<V>}
         */
        this._observableData = new ObservableData(null);
        this._dataTransformer = dataTransformer;
    }

    /**
     * Set new underlying data source
     * @param {DataSource<U>} dataSource the data source that produce data
     * that can be consumed by dataTransformer @see DataSourceTransfomer#constructor
     */
    set dataSource(dataSource) {
        this._dataSource = dataSource;
        this._dataSource.observableData.observe(() => {
            this._observableData.current = this._dataTransformer(this._dataSource.observableData.current);
        });
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    async fetch(args) {
        if (!this._dataSource) {
            throw new Error('Data source not provided');
        }
        await this._dataSource.fetch(args);
    }
}
