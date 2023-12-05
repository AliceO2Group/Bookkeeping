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
import { table } from '../../../components/common/table/table.js';
import { RunsPeriodActiveColumns } from '../ActiveColumns/runsPerPeriodActiveColumns.js';
import { paginationComponent } from '../../../components/Pagination/paginationComponent.js';
import { estimateDisplayableRowsCount } from '../../../utilities/estimateDisplayableRowsCount.js';

const TABLEROW_HEIGHT = 59;
// Estimate of the navbar and pagination elements height total; Needs to be updated in case of changes;
const PAGE_USED_HEIGHT = 215;

// eslint-disable-next-line require-jsdoc
const getDetecotsActiveColumns = (detectors) => Object.fromEntries(detectors?.map(({ name }) => [
    name, {
        name: name.toUpperCase(),
        visible: true,
        format: (_, run) => {
            const detectorsQualities = Object.fromEntries(run.detectorsQualities.map(({ name, quality }) => [name, quality]));

            return h('', {
                class: detectorsQualities[name] ? `btn run-quality ${detectorsQualities[name]}` : '',
            }, detectorsQualities[name] || '');
        },
    },
]) ?? []);

// eslint-disable-next-line require-jsdoc
export const RunsPerPeriodPage = ({ runsPerPeriodModel }) => {
    runsPerPeriodModel.pagination.provideDefaultItemsPerPage(estimateDisplayableRowsCount(
        TABLEROW_HEIGHT,
        PAGE_USED_HEIGHT,
    ));

    const activeColumns = {
        ...RunsPeriodActiveColumns,
        ...getDetecotsActiveColumns(runsPerPeriodModel.detectors),
    };

    return h('.flex-column.w-100', [
        table(runsPerPeriodModel.runs, activeColumns),
        paginationComponent(runsPerPeriodModel.pagination),

    ]);
};
