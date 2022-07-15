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

import errorAlert from '../../../components/common/errorAlert.js';
import spinner from '../../../components/common/spinner.js';
import { h } from '/js/src/index.js';
import { lhcFillDisplayConfiguration } from '../../LhcFills/Detail/lhcFillDisplayConfiguration.js';
import { detailsList } from '../../../components/Detail/detailsList.js';
import { runLhcFillDisplayConfiguration } from './runLhcFillDisplayConfiguration.js';

/**
 * Show the lhc data panel
 * @param {Object} model General model
 * @returns {vnode} Value of run
 */
const lhcFillPanel = (model) => {
    const { lhcFill } = model.runs;
    return lhcFill.match({
        NotAsked: () => model.runs.fetchLhcFill(),
        Loading: () => spinner({ size: 5, absolute: false }),
        Success: (payload) => [
            h('strong', 'LHC Data'),
            detailsList(lhcFillDisplayConfiguration, payload, 'lhc-fill', '-'),
            detailsList(runLhcFillDisplayConfiguration, model.runs.getRun().payload, 'run-lhc-fill', '-'),
        ],
        Failure: (error) => error.map(errorAlert),
    });
};

export default lhcFillPanel;
