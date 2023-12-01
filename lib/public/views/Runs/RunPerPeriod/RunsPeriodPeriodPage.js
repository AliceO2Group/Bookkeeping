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

import { h, switchCase } from '/js/src/index.js';
import { table } from '../../../components/common/table/table.js';
import { RunsPeriodActiveColumns } from '../ActiveColumns/runsPerPeriodActiveColumns.js';

// eslint-disable-next-line require-jsdoc
export const RunsPerPeriodPage = ({ runsPerPeriodModel }) => {
    const detectors = runsPerPeriodModel.detectorsFilterModel?.dropdownModel?.availableOptions.payload?.map(({ value }) => value).sort();
    const DetectorsActiveColumns = Object.fromEntries(detectors?.map((d) => [
        d, {
            name: d.toUpperCase(),
            visible: true,
            format: (_, run) => {
                const detectorsQualities = Object.fromEntries(run.detectorsQualities.map(({ name, quality }) => [name, quality]));

                return h('', { class: switchCase(detectorsQualities[d], {
                    good: 'bg-success',
                    bad: 'bg-danger',
                }, 'bg-gray') }, detectorsQualities[d]);
            },
        },
    ]) ?? []);

    const activeColumns = {
        ...RunsPeriodActiveColumns,
        ...DetectorsActiveColumns,
    };

    return h('', [table(runsPerPeriodModel.runs, activeColumns)]);
};
