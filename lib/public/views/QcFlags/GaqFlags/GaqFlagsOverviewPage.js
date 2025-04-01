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

import { h, sessionService } from '/js/src/index.js';
import { table } from '../../../components/common/table/table.js';
import { qcFlagsBreadcrumbs } from '../../../components/qcFlags/qcFlagsBreadcrumbs.js';
import { createGaqFlagsActiveColumns } from '../ActiveColumns/gaqFlagsActiveColumns.js';
import { gaqDetectorsSelectionModalTrigger } from './gaqDetectorsSelectionModalTrigger.js';
import { BkpRoles } from '../../../domain/enums/BkpRoles.js';
import { mergeRemoteData } from '../../../utilities/mergeRemoteData.js';
import errorAlert from '../../../components/common/errorAlert.js';
import spinner from '../../../components/common/spinner.js';

/**
 * Render GAQ Flags Overview page
 * @param {Model} model The overall model object.
 * @returns {Component} The overview page
 */
export const GaqFlagsOverviewPage = ({
    qcFlags: { gaqOverviewModel },
    modalModel,
}) => {
    const {
        dataPass: remoteDataPass,
        dataPassId,
        run: remoteRun,
        runNumber,
        items: gaqFlags,
        gaqDetectors: remoteGaqDetectors,
    } = gaqOverviewModel;

    const activeColumns = remoteGaqDetectors.match({
        Success: (gaqDetectors) => createGaqFlagsActiveColumns(gaqDetectors, { dataPassId, runNumber }),
        Other: () => ({ nocolumn: {} }),
    });

    return h(
        '',
        { onremove: () => gaqOverviewModel.reset() },
        mergeRemoteData([remoteDataPass, remoteRun, remoteGaqDetectors]).match({
            NotAsked: () => null,
            Failure: (errors) => errorAlert(errors),
            Success: ([dataPass, run, detector]) => [
                h('.flex-row.justify-between.items-center', [
                    qcFlagsBreadcrumbs({ dataPass, run, detector }, 'GAQ'),
                    sessionService.hasAccess([BkpRoles.ADMIN, BkpRoles.GAQ]) && gaqDetectorsSelectionModalTrigger(gaqOverviewModel, modalModel),
                ]),

                h('.w-100.flex-column', [
                    table(
                        gaqFlags,
                        activeColumns,
                        { classes: '.table-sm' },
                        null,
                    ),
                ]),
            ],
            Loading: () => spinner(),
        }),
    );
};
