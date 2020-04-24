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
import { Observable, fetchClient } from '/js/src/index.js';

/**
 * Model representing handlers for homePage.js
 */
export default class Overview extends Observable {
    /**
     * The constructor of the Overview model object
     * @param {Object} model Pass the model to access the defined functions
     * @returns {Object} Constructs the Overview model
     */
    constructor(model) {
        super();
        this.model = model;
        this.filterCriteria = [];
        this.data = [];
        this.filtered = [];
        this.headers = ['ID', 'Author ID', 'Title', 'Creation Time'];

        this.fetchData();
    }

    /**
     * Get the headers from the Overview class
     * @returns {Array} Returns the headers
     */
    getHeaders() {
        return this.headers;
    }

    /**
     * Fetch all relevant logs data from api
     * @returns {undefined} Injects the data object with the response data
     */
    async fetchData() {
        const response = await fetchClient('/api/logs', { method: 'GET' });
        const result = await response.json();
        this.data = result.data;
        this.filtered = [...result.data];
        this.notify();
    }

    /**
     * Getter for all the data
     * @returns {Array} Returns all of the data
     */
    getData() {
        return this.data;
    }

    /**
     * Get the table data
     * @returns {Array} The data without the tags to be rendered in a table
     */
    getDataWithoutTags() {
        const subentries = this.filtered.map((entry) => {
            const columnData = Object.keys(entry).map((subkey) => {
                // Filter out the field not needed for the table
                if (subkey !== 'tags' && subkey !== 'content') {
                    if (subkey === 'creationTime') {
                        return new Date(entry[subkey]).toLocaleString();
                    }

                    return entry[subkey];
                }
            });
            return columnData.filter((item) => item !== undefined);
        });

        return subentries;
    }

    /**
     * Add filter to the selection
     * @param {string} tag The tag to be added to the filter criteria
     * @returns {Array} Sets the data according to the filters applied
     */
    addFilter(tag) {
        this.filterCriteria = [...this.filterCriteria, tag];
        this.getFilteredData();
    }

    /**
     * Remove filter from the selection
     * @param {string} condition The ocondition to filter the array on
     * @returns {Array} Sets the array with the new filter criteria
     */
    removeFilter(condition) {
        this.filterCriteria = this.filterCriteria.filter((tag) => tag !== condition);
        this.getFilteredData();
    }

    /**
     * Filter the data
     * @returns {Array} Sets the data according to the amount of applied filters
     */
    getFilteredData() {
        this.filterCriteria.length !== 0
            ? this.filterByTags()
            : (this.filtered = [...this.data]);

        this.notify();
    }

    /**
     * Filter data by tags if applicable
     * @returns {Array} Sets the filtered data on the criterium applied by the user
     */
    filterByTags() {
        this.filtered = this.data
            .map((entry) => {
                let match = this.checkExistingTag(entry);

                if (match) {
                    return entry;
                }

                return null;
            })
            .filter((entry) => entry !== null);
    }

    /**
     * Check for an existing tag
     * @param {Object} entry The entry in the total array of the data
     * @return {Boolean} Returns the status of the existence of a tag in the data entry
     */
    checkExistingTag(entry) {
        const check = this.filterCriteria.map((tag) => {
            const match = entry.tags.includes(tag);
            if (match) {
                return 'Match';
            }
            return 'No Match';
        });

        return check.includes('Match');
    }

    /**
     * Counts the tags with their total appearances
     * @return {Object} Returns the count of each tag
     */
    getTagCounts() {
        return this.data.reduce((accumulator, currentValue) => {
            currentValue.tags.forEach((tag) => {
                accumulator[tag] = (accumulator[tag] || 0) + 1;
            });
            return accumulator;
        }, {});
    }
}
