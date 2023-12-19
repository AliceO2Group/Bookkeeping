/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

import { lineChartComponent } from '../../../components/common/chart/lineChart/lineChartComponent.js';
import { h } from '@aliceo2/web-ui-frontend';
import { formatPercentage } from '../../../utilities/formatting/formatPercentage.js';
import { ChartColors } from '../chartColors.js';
import { centeredComponent } from '../../../components/common/centeredComponent.js';

/**
 * Return the efficiency chart component for a given fill statistics
 *
 * @param {DetectorsEfficienciesPerFill[]} detectorEfficiencies the statistics to represent
 * @param {boolean} net true if the efficiencies are net efficiencies
 * @param {string[]} detectors the list of detectors names for which data must be displayed
 * @param {string[]} colors the list of colors to apply to the detectors
 * @param {function} [onPointHover] function called when a point is hovered
 * @return {Component} the resulting component
 */
export const detectorsEfficienciesComponent = (detectorEfficiencies, net, detectors, colors, onPointHover) => {
    if (detectors.length === 0) {
        return centeredComponent('No detector selected');
    }

    return lineChartComponent(
        detectorEfficiencies.map(({ fillNumber, efficiencies, netEfficiencies }) => ({
            x: fillNumber,
            y: detectors.map((detector) => (net ? netEfficiencies : efficiencies)[detector] ?? 0),
        })),
        {
            placeholder: 'No fill on the given period',
            tooltip: ({ x, y }) => h('', { key: detectors.join('') }, [
                h('h5', `Fill #${x}`),
                ...detectors.map((key, i) => h('.flex-row.items-center.g2', [
                    h('.tooltip-bullet', { style: `background-color: ${colors[i] ?? ChartColors.Blue.dark}` }),
                    h('', `${key}: ${formatPercentage(y[i], 2)}`),
                ])),
            ]),
            onPointHover,
            chartConfiguration: {
                axis: {
                    y: {
                        ticks: { format: (efficiency) => formatPercentage(efficiency, 0) },
                        label: net ? 'Net efficiency' : 'Efficiency',
                        min: 0,
                        max: 1,
                    },
                    x: {
                        label: 'FILL',
                    },
                },
                datasets: [
                    ...detectors.map((_, i) => ({
                        point: {
                            fill: colors[i] ?? ChartColors.Blue.dark,
                            radius: 5,
                        },
                        line: {
                            stroke: colors[i] ?? ChartColors.Blue.dark,
                        },
                    })),
                ],
            },
        },
    );
};
