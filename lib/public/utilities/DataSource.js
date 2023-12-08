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
import { ObservableData } from './ObservableData.js';

/**
 * Class to abstract notifying from data changes
 * @template T - type of data served by data source
 */
export class DataSource extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();
        this._dataSource = null;

        /**
         * Produce default (initial) value stored in ObservableData
         * @return {*} default
         */
        this._default = () => null;

        /**
         * @type {ObservableData<T>}
         * @private
         */
        this._observableData = new ObservableData(null);
    }

    /**
     * Fetch data
     * @param {*} _args arguments used by this data sources or underlying one
     * @return {Promise<void>} resolves once the data fetching has ended
     * @abstract
     */
    async fetch(_args) {
        throw new Error('Abstract class');

        /**
         * Overriden method should call fetch of inner data source (if exists)
         */
        // eslint-disable-next-line capitalized-comments
        // await this._dataSource.fetch(args);
    }

    /**
     * Add new data source to pipeline
     * @param {DataSource|Function} pipelineElement next data source in pipeline or function to observe ObservableData of current data source
     * @param {object} [options] options modifying behaviour
     * @param {boolean} [options.setAutoCleaning = true] if true setAutoCleaning of ancestors, @see DataSource#setAutoCleaning
     * @return {DataSource} this
     */
    feeds(pipelineElement, { setAutoCleaning = true } = {}) {
        if (pipelineElement instanceof DataSource) {
            pipelineElement.dataSource = this;
            return pipelineElement;
        } else if (pipelineElement instanceof Function) {
            this._observableData.observe(() => pipelineElement(this._observableData.current));
            if (setAutoCleaning) {
                this.setAutoCleaning();
            }
            return this;
        } else {
            throw new Error(`Icorrect argument type <${typeof pipelineElement}>`);
        }
    }

    /**
     * Set underyling data source
     * @param {DataSource} dataSource underlying data source
     */
    set dataSource(dataSource) {
        this._dataSource = dataSource;
    }

    /**
     * Get underyling data source
     */
    get dataSource() {
        return this._dataSource;
    }

    /**
     * Return the observable remote data provided by this source
     * @return {ObservableData<T>} the observable remote data
     */
    get observableData() {
        return this._observableData;
    }

    /**
     * Set observer on obervableData: after new data arrived, data from ancestral data sources are erased
     * @return {void}
     */
    setAutoCleaning() {
        this._observableData.observe(() => {
            let ds = this._dataSource;
            while (ds) {
                ds.observableData.setSilently(ds._default());
                ds = ds._dataSource;
            }
        });

        return this;
    }
}
