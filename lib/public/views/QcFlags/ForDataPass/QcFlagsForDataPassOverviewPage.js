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
import { QcFlagsOverviewComponenet } from '../Overview/qcFlagOverviewComponent.js';
import { frontLink } from '../../../components/common/navigation/frontLink.js';

/**
 * Render Quality Control Flags For Data Pass Overview page
 * @param {Model} model The overall model object.
 * @returns {Component} The overview page
 */
export const QcFlagsForDataPassOverviewPage = ({ qcFlagsModel: { overviewForDataPassModel: qcFlagsForDataPassOverviewModel } }) => {
    /**
     * Create links to runs per Data pass
     * @param {DataPass} dataPass the Data pass
     * @return {Componenet} in-breadcrumbs link to runs per Data page
     */
    const productionLinkFactory = (dataPass) =>
        h('h2', frontLink(dataPass.name, 'runs-per-data-pass', { dataPassId: dataPass.id }));
    return QcFlagsOverviewComponenet(qcFlagsForDataPassOverviewModel, { productionLinkFactory });
};
