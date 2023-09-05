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

import { h } from '/js/src/index.js';
import { markdownInput } from '../../../../components/common/markdown/markdown.js';

/**
 * Generates the EoS report form part specific to DCS report
 *
 * @param {object} formData the creation model's form current data
 * @return {vnode} the ecs form specific part
 */
export const eosFormDcsSpecificPart = (formData) => h('#type-specific', h('.panel', [
    h('label.panel-header', 'Alert handling'),
    markdownInput(
        formData.typeSpecific.alerts,
        {
            // eslint-disable-next-line no-return-assign
            oninput: (e) => formData.typeSpecific.alerts = e.target.value,
        },
        null,
        { height: '20rem' },
    ),
]));
