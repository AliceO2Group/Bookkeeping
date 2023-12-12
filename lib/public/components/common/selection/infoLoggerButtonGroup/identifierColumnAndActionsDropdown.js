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

import { frontLink } from '../../navigation/frontLink.js';
import { dropdown } from '../../popover/dropdown.js';
import { iconCaretBottom } from '/js/src/icons.js';
import { h } from '/js/src/index.js';

/**
 * Renders a button group with an identifier column and actions dropdown.
 *
 * @param {string} page The page to link to.
 * @param {string} linkContent The content of the link.
 * @param {Object} parameters The parameters for the link.
 * @param {Component[]} dropdownEntries The component entries for the dropdown.
 * @returns {Component} The identifierColumnAndActionsDropdown component.
 */
export const identifierColumnAndActionsDropdown = (page, linkContent, parameters, dropdownEntries) =>
    h(
        '.flex-row.items-center.btn-group',
        [
            frontLink(linkContent, page, parameters, { class: 'btn btn-primary' }),
            dropdown(
                h('.btn.btn-group-item.last-item', iconCaretBottom()),
                h(
                    '.flex-column.p2.g3',
                    dropdownEntries,
                ),
            ),
        ],
    );
