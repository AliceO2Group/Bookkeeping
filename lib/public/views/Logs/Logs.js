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
        this.filteredData = [];
        this.moreFilters = false;
        this.error = false;
    }

    /**
     * Retrieve every relevant log from the API
     * @returns {undefined} Injects the data object with the response data
     */
    async fetchAllLogs() {
        const response = await fetchClient('/api/logs', { method: 'GET' });
        const result = await response.json();

        if (result.data) {
            this.data = result.data;
            this.filteredData = result.data;
            this.error = false;
        } else {
            this.error = true;
        }

        this.notify();
    }

    /**
     * Retrieve a specified log from the API
     * @param {Number} id The ID of the log to be found
     * @returns {undefined} Injects the data object with the response data
     */
    async fetchOneLog(id) {
        // Do not call this endpoint again if we already have all the logs
        if (this.data && this.data.length < 1) {
            const response = await fetchClient(`/api/logs/${id}`, { method: 'GET' });
            const result = await response.json();

            if (result.data) {
                this.data = [result.data];
                this.filteredData = [result.data];
                this.error = false;
            } else {
                this.error = true;
            }

            this.notify();
        }
    }

    /**
     * Getter for all the data
     * @returns {Array} Returns all of the data
     */
    getData() {
        return this.filteredData;
    }

    /**
     * Indicates if there was an error during log fetching
     * @returns {Boolean} Returns if an error occured during log fetching
     */
    didErrorOccur() {
        return this.error;
    }

    /**
     * Add filter to the selection
     * @param {string} tag The tag to be added to the filter criteria
     * @returns {Array} Sets the data according to the filters applied
     */
    addFilter(tag) {
        this.filterCriteria = [...this.filterCriteria, tag];
        this.setFilteredData();
    }

    /**
     * Remove filter from the selection
     * @param {string} condition The condition to filter the array on
     * @returns {Array} Sets the array with the new filter criteria
     */
    removeFilter(condition) {
        this.filterCriteria = this.filterCriteria.filter((tag) => tag !== condition);
        this.setFilteredData();
    }

    /**
     * Filter the data
     * @returns {Array} Sets the data according to the amount of applied filters
     */
    setFilteredData() {
        this.filterCriteria.length !== 0
            ? this.filterByTags()
            : this.filteredData = this.data;

        this.notify();
    }

    /**
     * Filter data by tags if applicable
     * @returns {Array} Sets the filtered data on the criteria applied by the user
     */
    filterByTags() {
        this.filteredData = this.data.filter((entry) => this.checkExistingTag(entry));
    }

    /**
     * Check for an existing tag
     * @param {Object} entry The entry in the total array of the data
     * @return {Boolean} Returns the status of the existence of a tag in the data entry
     */
    checkExistingTag(entry) {
        return this.filterCriteria.filter((tag) => entry.tags.filter(({ text }) => tag === text).length > 0).length > 0;
    }

    /**
     * Counts the tags with their total appearances
     * @return {Object} Returns the count of each tag
     */
    getTagCounts() {
        return this.data.reduce((accumulator, currentValue) => {
            currentValue.tags.forEach(({ text: tag }) => {
                accumulator[tag] = (accumulator[tag] || 0) + 1;
            });
            return accumulator;
        }, {});
    }

    /**
     * Toggles the visibility of tag filters above the predefined limit
     * @return {Boolean} whether the extra filter should be shown
     */
    toggleMoreFilters() {
        this.moreFilters = !this.moreFilters;
        this.notify();
    }
}
