/**
 * @license
 * Copyright 2019-2020 CERN and copyright holders of ALICE O2.
 * See http://alice-o2.web.cern.ch/copyright for details of the copyright holders.
 * All rights not expressly granted are reserved.
 *
 * This software is distributed under the terms of the GNU General Public
 * License v3 (GPL Version 3), copied verbatim in the file "COPYING".
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

import { h } from '/js/src/index.js';

/**
 * Display a filter composed of checkbox listing pre-defined options
 * @param {SelectionModel} selectionModel filter model
 * @param {Object} [additionalProperties = {}] additional options that can be given to checkboxes.
 * @param {string} [additionalProperties.selector] input identifiers prefix
 * @return {Component} filter component
 */
export const checkboxes = (selectionModel, additionalProperties = {}) => {
    const { selector = 'checkboxes' } = additionalProperties;

    return h('.flex-row.flex-wrap', selectionModel.options.map((option) => h('.form-check.flex-grow', [
        h('input.form-check-input', {
            id: `${selector}-checkbox-${option.value}`,
            type: 'checkbox',
            checked: selectionModel.isSelected(option),
            onchange: () => selectionModel.isSelected(option) ? selectionModel.deselect(option) : selectionModel.select(option),
            ...additionalProperties,
        }),
        h('label.form-check-label', {
            for: `${selector}-checkbox-${option.value}`,
        }, option.label || option.value),
    ])));
};
