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
import { iconCaretBottom } from '/js/src/icons.js';
import { DropdownComponent, h } from '/js/src/index.js';

/**
 * Renders a link as a button alongside an arrow to open a dropdown
 *
 * @param {string} linkContent the content of the link
 * @param {string} page the target page of the link
 * @param {Object} parameters the url parameters of the link
 * @param {Component} dropdownBody the body of the dropdown
 * @param {string} textMinWidth minimum width of the link text (e.g. '100px')
 * @returns {Component} the link with dropdown component
 */
export const buttonLinkWithDropdown = (linkContent, page, parameters, dropdownBody, textMinWidth) =>
    h(
        '.flex-row.items-center.btn-group',
        [
            frontLink(linkContent, page, parameters, {
                class: 'btn btn-primary white',
                style: textMinWidth ? `min-width: ${textMinWidth};` : '',
            }),
            DropdownComponent(
                h('.btn.btn-group-item.last-item', iconCaretBottom()),
                h(
                    '.flex-column.p2.g2',
                    dropdownBody,
                ),
            ),
        ],
    );
