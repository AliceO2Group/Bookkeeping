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
import { commonLhcFillDisplayConfiguration } from '../../LhcFills/Detail/commonLhcFillDisplayConfiguration.js';
import { detailsList } from '../../../components/Detail/detailsList.js';
import { runLhcFillDisplayConfiguration } from './runLhcFillDisplayConfiguration.js';

/**
 * Show the lhc data panel
 * @param {RemoteData<Run>} run the run for which lhc fill information have to be displayed
 * @returns {Component} run's LHC fill information
 */
export const lhcFillPanel = (run) => [
    h('strong', 'LHC Data'),
    run.match({
        NotAsked: () => null,
        Loading: () => spinner({ size: 5, absolute: false }),
        Success: (payload) => [
            detailsList(commonLhcFillDisplayConfiguration, payload.lhcFill || {}, { selector: 'lhc-fill' }),
            detailsList(runLhcFillDisplayConfiguration, payload, { selector: 'run-lhc-fill' }),
        ],
        Failure: (error) => error.map(errorAlert),
    }),
];
