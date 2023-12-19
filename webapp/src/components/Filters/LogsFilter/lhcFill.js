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

import { h } from '@aliceo2/web-ui-frontend';

/**
 * Returns the LHC fills filter component
 * @param {LogModel} logsModel the log model object
 * @return {vnode} A text box that allows the user to enter LHC fill numbers to filter the logs
 */
export const lhcFillsFilter = (logsModel) => h('input.w-75.mt1', {
    type: 'text',
    id: 'lhcFillsFilter',
    value: logsModel.getLhcFillsFilterRaw(),
    oninput: (e) => logsModel.setLhcFillsFilter(e.target.value),
}, '');
