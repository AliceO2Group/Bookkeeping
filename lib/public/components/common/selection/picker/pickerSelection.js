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

import { h } from '/js/src/index.js';

/**
 * Displays the current picker selection as pills
 *
 * @param {SelectionModel} selectionModel the selection model
 * @param {Component} placeHolder placeholder used if selection is empty
 * @return {Component} the current selection
 */
export const pickerSelection = (selectionModel, placeHolder) => selectionModel.selectedOptions.length
    ? h(
        '.flex-row.flex-wrap.g2',
        selectionModel.selectedOptions.map(({ rawLabel, label, value }) => h(
            '',
            { key: rawLabel || label || value },
            label || value,
        )),
    )
    : placeHolder;
