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
import { frontLink } from '../../../components/common/navigation/frontLink.js';
import { estimateDisplayableRowsCount } from '../../../utilities/estimateDisplayableRowsCount.js';
import { table } from '../../../components/common/table/table.js';
import { qcFlagsActiveColumns } from '../ActiveColumns/qcFlagsActiveColumns.js';
import { qcFlagCreationPanelLink } from '../../../components/qcFlags/qcFlagCreationPanelLink.js';
import { qcFlagsChartComponent } from '../qcFlagsVisualization/qcFlagsChartComponent.js';
import { mergeRemoteData } from '../../../utilities/mergeRemoteData.js';
import { qcFlagsBreadcrumbs } from '../../../components/qcFlags/qcFlagsBreadcrumbs.js';
import errorAlert from '../../../components/common/errorAlert.js';
import spinner from '../../../components/common/spinner.js';
import { remoteDplDetectorUserHasAccessTo } from '../../../services/detectors/remoteDplDetectorUserHasAccessTo.js';

const TABLEROW_HEIGHT = 35;
// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const PAGE_USED_HEIGHT = 215;

/**
 * Render Quality Control Flags For Data Pass Overview page
 * @param {Model} model The overall model object.
 * @returns {Component} The overview page
 */
export const QcFlagsForDataPassOverviewPage = ({
    qcFlags: { forDataPassOverviewModel: qcFlagsForDataPassOverviewModel },
    dplDetectorsUserHasAccessTo: remoteDplDetectorsUserHasAccessTo,
}) => {
    const {
        dataPass: remoteDataPass,
        run: remoteRun,
        detectorId,
        dplDetector: remoteDplDetector,
        items: remoteQcFlags,
        sortModel,
    } = qcFlagsForDataPassOverviewModel;

    qcFlagsForDataPassOverviewModel.pagination.provideDefaultItemsPerPage(estimateDisplayableRowsCount(
        TABLEROW_HEIGHT,
        PAGE_USED_HEIGHT,
    ));

    const activeColumns = {
        qcFlagId: {
            name: 'Id',
            visible: true,
            format: (qcFlagId, { dataPassId, detectorId, runNumber }) =>
                frontLink(
                    h('.btn.btn-primary.white', qcFlagId),
                    'qc-flag-details-for-data-pass',
                    { id: qcFlagId, dataPassId, runNumber, detectorId },
                ),
            classes: 'w-5',
        },
        ...qcFlagsActiveColumns,
    };

    return h(
        '.flex-column',
        { onremove: () => qcFlagsForDataPassOverviewModel.reset() },
        mergeRemoteData([
            remoteDataPass,
            remoteRun,
            remoteDplDetector,
            remoteDplDetectorUserHasAccessTo(detectorId, remoteDplDetectorsUserHasAccessTo),
            remoteQcFlags,
        ]).match({
            NotAsked: () => null,
            Failure: (errors) => errorAlert(errors),
            Success: ([dataPass, run, detector, detectorUserHasAccessTo, flags]) => [
                h('.flex-row.justify-between.items-center', [
                    qcFlagsBreadcrumbs({ dataPass, run, detector }),
                    qcFlagCreationPanelLink(
                        { dataPass },
                        run,
                        detectorUserHasAccessTo,
                    ),
                ]),
                qcFlagsChartComponent(flags, run),
                h('.w-100.flex-column', [
                    table(
                        flags,
                        activeColumns,
                        {
                            classes: (qcFlag) => ['.table-sm', qcFlag.deleted ? '.dimmed' : null]
                                .filter((classToken) => Boolean(classToken))
                                .join(''),
                        },
                        null,
                        { sort: sortModel },
                    ),
                ]),
            ],
            Loading: () => spinner(),
        }),
    );
};
