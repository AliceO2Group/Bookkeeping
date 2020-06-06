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
    // eslint-disable-next-line require-jsdoc
    const traverse = (obj, id) => {
        if (obj.id === id) {
            return obj;
        }

        for (const child of obj.children) {
            const parent = traverse(child, id);
            if (parent) {
                return parent;
            }
        }

        return null;
    };

    for (const child of children) {
        if (!Array.isArray(child.children)) {
            child.children = [];
        }

        const parent = traverse(root, child.parentLogId);
        if (!Array.isArray(parent.children)) {
            parent.children = [];
        }

        parent.children.push(child);
    }

    return root;
};

module.exports = toTreeView;
