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

import { frontLink } from '../../../../components/common/navigation/frontLink.js';
import { tooltip } from '../../../../components/common/popover/tooltip.js';
import spinner from '../../../../components/common/spinner.js';
import { h, iconWarning } from '/js/src/index.js';
import { qcFlagDetailsComponent } from '../qcFlagDetailsComponent.js';

/**
 * Render QC flag details for data pass page
 *
 * @param {Model} model The overall model object.
 * @returns {Component} The details page
 */
export const QcFlagDetailsForDataPassPage = ({ qcFlags: { detailsForDataPassModel } }) => {
    const forDataPassQcFlagDetailsSpecificDisplayConfiguration = {
        dataPass: {
            name: 'Data pass',
            visible: true,
            format: () => detailsForDataPassModel.dataPass.match({
                Success: ({ name, id: dataPassId, pdpBeamType }) => frontLink(name, 'runs-per-data-pass', { dataPassId, pdpBeamType }),
                Loading: () => spinner({ size: 3, absolute: false }),
                NotAsked: () => tooltip(h('.f3', iconWarning()), 'No data pass data was asked for'),
                Failure: () => tooltip(h('.f3', iconWarning()), 'Not able to load data pass info'),
            }),
        },
    };

    return qcFlagDetailsComponent(detailsForDataPassModel, forDataPassQcFlagDetailsSpecificDisplayConfiguration);
};
