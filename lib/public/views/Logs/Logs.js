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
        this.errorMessages = '';
        this.title = '';
        this.text = '';
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
     * Create the log with the variables set in the model, handle errors appriopately
     * @returns {undefined}
     */
    async createLog() {
        const response = await fetchClient('api/logs', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: this.getTitle(),
                text: this.getText(),
            }),
        });

        const result = await response.json();

        if (result.data) {
            const logId = result.data.id;
            this.title = '';
            this.text = '';
            this.error = false;

            await this.fetchOneLog(logId);
            await this.model.router.go(`/?page=entry&id=${logId}`);
            this.notify();
        } else {
            this.error = true;
            this.errorMessages = result.errors;
            this.notify();
        }
    }

    /**
     * Returns the set errormessage
     * @returns {Array} Returns the set errormessage
     */
    getErrorMessages() {
        return this.errorMessages;
    }

    /**
     * Set the title paramter in the model
     * @param {String} title Received string from the view
     * @returns {undefined}
     */
    setTitle(title) {
        this.title = title;
        this.notify();
    }

    /**
     * Set the text paramter in the model
     * @param {String} text Received string from the view
     * @returns {undefined}
     */
    setText(text) {
        this.text = text;
        this.notify();
    }

    /**
     * Get the title value
     * @returns {String} the title in the model
     */
    getTitle() {
        return this.title;
    }

    /**
     * Get the text value
     * @returns {String} the text in the model
     */
    getText() {
        return this.text;
    }

    /**
     * Retrieve a specified log from the API
     * @param {Number} id The ID of the log to be found
     * @returns {undefined} Injects the data object with the response data
     */
    async fetchOneLog(id) {
        const response = await fetchClient(`/api/logs/${id}/tree`, { method: 'GET' });
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

    /**
     * Getter for all the data
     * @returns {Array} Returns all of the data
     */
    getData() {
        return this.filteredData;
    }

    /**
     * Getter for filter criteria
     * @returns {Boolean} Returns if more filters should be shown above the predefined limit
     */
    shouldShowMoreFilters() {
        return this.moreFilters;
    }

    /**
     * Getter for error occurrence
     * @returns {Boolean} Returns if an error occurred during log fetching
     */
    hasErrorOccurred() {
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
        this.filteredData = this.data.filter((entry) => this.hasExistingTag(entry));
    }

    /**
     * Check for an existing tag
     * @param {Object} entry The entry in the total array of the data
     * @return {Boolean} Returns the status of the existence of a tag in the data entry
     */
    hasExistingTag(entry) {
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
     * Checks if a tag is already defined within the user's filter criteria
     * @param {String} tag The tag to check on
     * @return {Boolean} Whether the tag is in the user's filter criteria
     */
    isTagInFilterCriteria(tag) {
        return this.filterCriteria.includes(tag);
    }

    /**
     * Toggles the visibility of tag filters above the predefined limit
     * @return {Boolean} Whether the extra filters should be shown
     */
    toggleMoreFilters() {
        this.moreFilters = !this.moreFilters;
        this.notify();
    }
}
