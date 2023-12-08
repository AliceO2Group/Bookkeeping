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

/**
 * Class to combine multiple data sources
 */
export class DataSourceBuilder extends Observable {
    /**
     * Constructor
     */
    constructor() {
        super();
        this._stack = [];
    }

    /**
     * Add new data source to pipeline
     * @param {DataSource} dataSource next data source in pipeline
     * @param {Function} dataObservers observers of data of given data source
     * @return {DataSourceBuilder} this
     */
    addDataSource(dataSource, dataObservers = []) {
        (Array.isArray(dataObservers) ? dataObservers : [dataObservers]).forEach((observer) => dataSource.observableData.observe(observer));
        const lastDataSource = this._stack[this._stack.length - 1];
        if (lastDataSource) {
            lastDataSource.dataSource = dataSource;
        }
        return this;
    }

    /**
     * Return built, single data source
     * @return {DataSource} combination of multiple data sources;
     */
    get() {
        return this._stack[this._stack.length - 1];
    }
}
