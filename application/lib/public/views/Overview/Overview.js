/**
 * This file is part of the ALICE Electronic Logbook v2, also known as Jiskefet.
 * Copyright (C) 2020  Stichting Hogeschool van Amsterdam
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
import { Observable } from '/js/src/index.js';

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
        this.date = new Date().toDateString();
        this.filterCriteria = [];
        this.data = [
            {
                authorID: 'Batman',
                title: 'Run1',
                creationTime: this.date,
                tags: ['Tag1', 'Tag2'],
            },
            {
                authorID: 'Joker',
                title: 'Run2',
                creationTime: this.date,
                tags: ['Tag2'],
            },
            {
                authorID: 'Anonymous',
                title: 'Run5',
                creationTime: this.date,
                tags: ['Tag3'],
            },
        ];
        this.filtered = [...this.data];
        this.headers = ['ID', 'Author ID', 'Title', 'Creation Time'];
    }

    /**
     * Get the headers from the Overview class
     * @returns {Array} Returns the headers
     */
    getHeaders() {
        return this.headers;
    }

    /**
     * Get the table data
     * @returns {Array} The data without the tags to be rendered in a table
     */
    getTableData() {
        const subentries = this.filtered.map((entry) => {
            const filter = Object.keys(entry).map((subkey) => {
                if (subkey !== 'tags') {
                    return entry[subkey];
                }
            });

            return filter;
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
