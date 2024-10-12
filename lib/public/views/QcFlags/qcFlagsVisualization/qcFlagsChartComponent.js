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

import { barChartComponent } from '../../../components/common/chart/barChart/barChartComponent.js';
import { BarPattern } from '../../../components/common/chart/rendering/dataset/renderDatasetAsBars.js';
import { formatTimestamp } from '../../../utilities/formatting/formatTimestamp.js';
import { ChartColors } from '../../Statistics/chartColors.js';

/**
 * Create QC flags visualiation as horizontall bar chart
 *
 * @param {QualityControlFlag[]} flags flags order by createdAt in descending manner
 * @param {Run} run the run associated with given flags
 * @return {Component} the QC flags visualization
 */
export const qcFlagsChartComponent = (flags, run) => {
    /**
     * Get bars' data for effective and ineffectie periods of given QC flag
     * Bars corresponging with effective periods have flagType.color
     * For ineffective periods bars are additionally marked with stripes pattern
     * @param {QcFlag} flag a QC flag
     * @return {Bar[]} bars data
     */
    const getBarsForEffectiveAndIneffectivePeriodsOfQcFlag = (flag) => {
        const { from, to, effectivePeriods } = flag;
        const ineffectivePeriods = [];
        if (effectivePeriods.length > 0) {
            if (from !== effectivePeriods[0]?.from) {
                ineffectivePeriods.push({ from, to: effectivePeriods[0].form });
            }

            let index = 0;
            while (index < effectivePeriods.length - 1) {
                const effectivePeriod = effectivePeriods[index];
                const nextEffectivePeriod = effectivePeriods[index + 1];
                ineffectivePeriods.push({ from: effectivePeriod.to, to: nextEffectivePeriod.from });
                index ++;
            }

            const lastEffectivePeriod = effectivePeriods[effectivePeriods.length - 1];
            if (to !== lastEffectivePeriod?.to) {
                ineffectivePeriods.push({ from: lastEffectivePeriod.to, to });
            }
        } else {
            ineffectivePeriods.push({ from, to });
        }

        return [
            ...effectivePeriods.map(({ from, to }) => ({
                ...flag,
                y: `${flag.flagType.name} (id:${flag.id})`,
                x: [from, to],
                fill: flag.flagType.color,
            })),
            ...ineffectivePeriods.map(({ from, to }) => ({
                ...flag,
                y: `${flag.flagType.name} (id:${flag.id})`,
                x: [from, to],
                fill: flag.flagType.color,
                pattern: BarPattern.DIAGONAL_STRIPES,
                stroke: 'none',
                opacity: 0.65,
            })),
        ];
    };

    const barsData = [...flags].reverse().flatMap(getBarsForEffectiveAndIneffectivePeriodsOfQcFlag);

    return barChartComponent(
        barsData,
        {
            placeholder: 'No data',
            chartConfiguration: {
                axis: {
                    x: {
                        label: 'Time',
                        ticks: { format: (t) => formatTimestamp(t, true) },
                        min: run.timeTrgStart ?? run.timeO2Start,
                        max: run.timeTrgEnd ?? run.timeO2End,
                    },
                    y: {
                        label: 'Flags',
                    },
                },
                datasets: {
                    bar: {
                        fill: ChartColors.Blue.dark,
                        stroke: ChartColors.Blue.light,
                    },
                },
                independentVariable: 'y',
                renderGrid: false,
            },
        },
    );
};
