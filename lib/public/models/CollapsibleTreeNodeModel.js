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
import { Observable, RemoteData } from '/js/src/index.js';

/**
 * Model to store a node of a collapsible tree
 * @template T the type of the node value
 * @template C the type of the node child
 */
export class CollapsibleTreeNodeModel extends Observable {
    /**
     * Constructor
     *
     * @param {T} value the actual value of the node
     */
    constructor(value) {
        super();
        this._value = value;
        this._isCollapsed = true;
        this._children = RemoteData.notAsked();
    }

    /**
     * Open/Collapse the node children (load them if needed)
     *
     * @return {void}
     */
    toggle() {
        if (this._isCollapsed) {
            // Open the node and load data if needed
            if (this._children.isNotAsked()) {
                this.fetchChildren();
            }
        }
        this._isCollapsed = !this._isCollapsed;
        this.notify();
    }

    /**
     * Fetch the children nodes
     *
     * @return {Promise<void>} resolve once the children has been fetched
     */
    async fetchChildren() {
        // To be implemented in subclasses
        return Promise.resolve();
    }

    /**
     * States if the current node is collapsed
     *
     * @return {boolean} true if the node is collapsed
     */
    get isCollapsed() {
        return this._isCollapsed;
    }

    /**
     * Returns the current node value
     *
     * @return {T} the value
     */
    get value() {
        return this._value;
    }

    /**
     * Returns the children of the node
     *
     * @return {RemoteData<C[]>} the children
     */
    get children() {
        return this._children;
    }

    /**
     * Defines the value of the node's children
     *
     * @param {RemoteData<C[]>} children the new children
     */
    set children(children) {
        this._children = children;
    }
}
