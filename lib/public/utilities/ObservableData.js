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
 * Observable providing a snapshot of a data that may change over time, notifying every time the value change
 */
export class ObservableData extends Observable {
    /**
     * Constructor
     * @template T
     *
     * @param {T} initial the initial value of the observable data
     */
    constructor(initial) {
        super();
        this._current = initial;
    }

    /**
     * Returns a builder to create a new observable data
     *
     * @return {ObservableDataBuilder} the builder
     */
    static builder() {
        return new ObservableDataBuilder();
    }

    /**
     * Returns the current value of the data
     * @return {T} the current value
     */
    getCurrent() {
        return this._current;
    }

    /**
     * Set the current value of the data and notify
     * @param {T} value the current value
     * @return {void}
     */
    setCurrent(value) {
        this._current = value;
        this.notify();
    }
}

/**
 * Observable data that applies a processing on every value that is pushed into it
 */
class ObservableDataWithProcessing extends ObservableData {
    /**
     * Constructor
     *
     * @param {initialValue} initialValue the initial value of the observable data
     * @param {function[]} processors the list of processing to apply to the values (processors must be chainable)
     */
    constructor(initialValue, processors) {
        super(initialValue);

        this._processors = processors;
    }

    /**
     * @inheritDoc
     */
    setCurrent(value) {
        let processedValue = value;

        for (const processor of this._processors) {
            processedValue = processor(processedValue);
        }

        super.setCurrent(processedValue);
    }
}

/**
 * Builder to create instance of observable data
 *
 * @template T
 */
class ObservableDataBuilder {
    /**
     * Constructor
     */
    constructor() {
        this._initialValue = null;

        /**
         * @type {ObservableData}
         * @private
         */
        this._source = null;
        this._processors = [];
    }

    /**
     * Set the initial value of the observable data
     *
     * @param {T} initialValue the initial value of the observable data
     * @return {this} the builder instance
     */
    initialValue(initialValue) {
        this._initialValue = initialValue;
        return this;
    }

    /**
     * Any time the source data value changes it will be reflected in the created observable data
     * NOTE that when this option is used, then first of optional processors must accept source.getCurrent()
     *
     * @param {ObservableData} source the source data
     * @return {this} the builder instance
     */
    source(source) {
        this._source = source;
        return this;
    }

    /**
     * Any time the one of sources' data value changes it will be reflected in the created observable data
     * NOTE that when this option is used, then first of optional processors must accept sources list mapped by #getCurrent() method
     *
     * @param {ObservableData[]} sources the list of source data
     * @return {this} the builder instance
     */
    sources(sources) {
        this._sources = sources;
        return this;
    }

    /**
     * Adds a processing function that will be applied to the observable data (map functions will be called in the same
     * order as they have been registered)
     *
     * @param {function} processor the function to apply to observable data
     * @return {this} the builder instance
     */
    apply(processor) {
        this._processors.push(processor);
        return this;
    }

    /**
     * Ends the building process and return the built observable data
     *
     * @return {ObservableData} the build observable data
     */
    build() {
        const initialValue = this._initialValue ?? this._source?.getCurrent();
        const observableData = new ObservableDataWithProcessing(initialValue, this._processors);
        if (this._source && this._sources) {
            throw Error('Cannot use sources() and source() in te same builder');
        }
        if (this._sources) {
            const sources = this._sources;
            sources.forEach((source) => source.observe(() => observableData.setCurrent(sources.map((source) => source.getCurrent()))));
        }

        if (this._source) {
            const source = this._source;
            source.observe(() => observableData.setCurrent(source.getCurrent()));
        }

        this._processors = [];
        this._initialValue = null;
        this._source = null;
        return observableData;
    }
}
