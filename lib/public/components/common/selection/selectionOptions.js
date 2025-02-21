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

import { cleanPrefix } from '../../../utilities/cleanPrefix.js';
import { filterSelectionOptions } from './filterSelectionOptions.js';
import { h } from '/js/src/index.js';

/**
 * Display the options of the given selection model
 *
 * @param {SelectionModel} selectionModel the selection model
 * @param {object} [configuration] eventual configuration
 * @param {string} [configuration.filter] if specified, only options with label (or value if no label) including this filter will be displayed
 * @param {Component} [configuration.placeholder] if specified, this component will be returned if there is no option to display
 * @param {string} [configuration.selectorPrefix] prefix to be used to construct elements selectors
 * @param {string[]} [configuration.labelClasses] additional classes applied to label
 * @return {Component} filter component
 */
export const selectionOptions = (selectionModel, configuration) => {
    const { filter, placeholder = null, selectorPrefix = '', labelClasses: additionalLabelClasses = [] } = configuration || {};

    const options = filterSelectionOptions(selectionModel.options, filter);

    if (options.length === 0) {
        return placeholder;
    }

    return options.map((option) => {
        const selector = option.selector ?? option.value;

        const uniqueSelector = `${cleanPrefix(selectorPrefix)}option-${selector}`;

        const labelClasses = ['form-check-label', 'flex-row', 'g2', ...additionalLabelClasses];

        return h(
            `label.${labelClasses.join('.')}`,
            { key: uniqueSelector },
            [
                h(
                    `input#${uniqueSelector}`,
                    {
                        id: uniqueSelector,
                        type: selectionModel.multiple || selectionModel.allowEmpty ? 'checkbox' : 'radio',
                        name: selectionModel.multiple || selectionModel.allowEmpty
                            ? uniqueSelector
                            : `${cleanPrefix(selectorPrefix)}option-group`,
                        checked: selectionModel.isSelected(option),
                        onchange: () => selectionModel.isSelected(option) ? selectionModel.deselect(option) : selectionModel.select(option),
                    },
                ),
                option.label || option.value,
            ],
        );
    });
};
