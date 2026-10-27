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
import { rawTextFilter } from '../common/filters/rawTextFilter.js';

/**
 * Renders a filter for the raw configuration of environments, allowing users to filter environments on a key, optionally with a value,
 * or on a text found anywhere in the raw configuration
 *
 * @param {RawConfigurationFilterModel} rawConfigurationFilterModel the raw configuration filter model
 * @return {Component} the filter
 */
export const rawConfigurationFilter = (rawConfigurationFilterModel) =>
    h('.flex-row.g2', [
        h(
            '.flex-column.flex-grow',
            // Bubble to update the value placeholder when a key is typed
            { oninput: () => rawConfigurationFilterModel.visualChange$.notify() },
            [
                rawTextFilter(
                    rawConfigurationFilterModel.keyModel,
                    { id: 'rawConfiguration-key', placeholder: 'e.g. hosts' },
                ),
            ],
        ),
        h('.flex-column.flex-grow', [
            rawTextFilter(
                rawConfigurationFilterModel.valueModel,
                {
                    id: 'rawConfiguration-value',
                    placeholder: rawConfigurationFilterModel.key ? 'e.g. some-host' : 'Search anywhere in the configuration',
                },
            ),
        ]),
    ]);
