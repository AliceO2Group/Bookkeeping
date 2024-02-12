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

import { PanelComponent } from '../../../../components/common/panel/PanelComponent.js';
import { h } from '/js/src/index.js';
import { LabelPanelHeaderComponent } from '../../../../components/common/panel/LabelPanelHeaderComponent.js';
import { markdownInput } from '../../../../components/common/markdown/markdown.js';

/**
 * Builds a panel containing the label and textarea for log content
 *
 * @param {string} value the actual log content
 * @param {function} onChange function called with new content when the log content is updated
 * @returns {vnode} - Content panel
 */
export const logCreationContentPanel = (value, onChange) => h(
    PanelComponent,
    { class: 'flex-column flex-grow' },
    [
        h(LabelPanelHeaderComponent, 'Content description*'),
        markdownInput(
            value,
            {
                id: 'text',
                placeholder: 'Your message...',
                // eslint-disable-next-line no-return-assign
                oninput: (e) => onChange(e.target.value),
            },
            { height: '100%' },
        ),
    ],
);
