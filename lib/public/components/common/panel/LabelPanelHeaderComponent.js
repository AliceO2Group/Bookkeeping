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

import { h } from '@aliceo2/web-ui/Frontend/js/src/index.js';

/**
 * Panel header component formed by a label
 */
export const LabelPanelHeaderComponent = {
    // eslint-disable-next-line require-jsdoc
    view: function ({ children, attrs: { required, ...attrs } }) {
        return h(
            'label.label.form-check-label.panel-header',
            {
                ...required ? { title: 'This field is mandatory' } : {},
                ...attrs,
            },
            required ? h('span.flex-row.g1', [children, h('.danger', '*')]) : children,
        );
    },
};
