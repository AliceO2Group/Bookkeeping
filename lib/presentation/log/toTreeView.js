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

/**
 * Builds a Log tree.
 *
 * @param {Object} root The start of the tree.
 * @param {Object} children The children which have to be included.
 * @returns {Object} The Log tree.
 */
const toTreeView = (root, children) => {
    /**
     * Traverses the tree to find the node with the specified ID.
     * @param {Object} obj - The current node being traversed.
     * @param {string} id - The ID of the node to find.
     * @returns {Object|null} - The node with the specified ID, or null if not found.
     */
    const traverse = (obj, id) => {
        if (obj.id === id) {
            return obj;
        }

        for (const child of obj.children || []) {
            const parent = traverse(child, id);
            if (parent) {
                return parent;
            }
        }

        return null;
    };

    const visitedLogs = new Set();

    for (const child of children) {
        if (!Array.isArray(child.children)) {
            child.children = [];
        }

        const parent = traverse(root, child.parentLogId);
        if (parent && child.id !== parent.id) { // Exclude parent log from being added as a child
            if (!Array.isArray(parent.children)) {
                parent.children = [];
            }

            if (!visitedLogs.has(child.id)) {
                parent.children.push(child);
                visitedLogs.add(child.id);
            }
        }
    }

    return root;
};

module.exports = toTreeView;
