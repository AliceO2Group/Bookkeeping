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
import spinner from '../../../components/common/spinner.js';
import table from '../../../components/Table/index.js';
import errorAlert from '../../../components/common/errorAlert.js';
import { runsActiveColumns } from '../../Runs/ActiveColumns/runsActiveColumns.js';
import { lhcFillDisplayConfiguration } from './lhcFillDisplayConfiguration.js';
import { detailsGrid } from '../../../components/Detail/detailsGrid.js';

/**
 * Component displaying information about a run
 *
 * @param {LhcFillDetailsModel} detailsModel the model of the fill to display
 *
 * @return {vnode} the component representing fill details
 */
export const lhcFillDetailsComponent = (detailsModel) => detailsModel.lhcFill.match({
    NotAsked: () => null,
    Loading: () => spinner(),
    Success: (payload) => {
        const { fillNumber, runs, stableBeamsStart } = payload;
        return h('', [
            h('.flex-row.items-center.g3', [
                h('h2', `Fill No. ${fillNumber}`),
                stableBeamsStart ? h('#stable-beam-badge.f3.badge.bg-primary.white', 'Stable beam') : null,
            ]),
            // Remove run number from the details grid
            detailsGrid(lhcFillDisplayConfiguration.slice(1), payload, 'lhc-fill', '-'),
            h('#runs', table(runs, runsActiveColumns)),
        ]);
    },
    Failure: (errors) => errorAlert(errors),
});
