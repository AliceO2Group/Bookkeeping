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

import { DropdownComponent, h } from '/js/src/index.js';
import { iconCaretBottom } from '/js/src/icons.js';
import { frontLink } from '../../navigation/frontLink.js';

/**
 * Display a bold link, followed by a discreet caret opening a dropdown with the actions available on the target of the link
 *
 * @param {string} id the id of the component
 * @param {string|number} linkContent the content of the link
 * @param {string} page the target page of the link
 * @param {Object} parameters the url parameters of the link
 * @param {Component[]} actions the actions displayed in the dropdown
 * @return {Component} the link with its actions
 */
export const linkWithActionsDropdown = (id, linkContent, page, parameters, actions) => h(`#${id}.flex-row.items-center.g1.f5`, [
    frontLink(linkContent, page, parameters, { class: 'bold' }),
    DropdownComponent(
        h('.clickable.gray-darker.ph1', iconCaretBottom()),
        h('.flex-column.p2.g2', actions),
    ),
]);
