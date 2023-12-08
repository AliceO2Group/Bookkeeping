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

import { select } from '/assets/d3.min.js';

/**
 * @typedef DatasetLegendConfiguration
 * @property {string} text the content of the legend
 */

const DATASET_MARGIN = 10;
const FONT_SIZE = 20;

/**
 * Render the given dataset configuration
 *
 * @param {SVGElement} svg the svg in which legend should be displayed
 * @param {Point[]} points the points of the dataset, used to compute the legend position
 * @param {PointLocator} pointLocator the point locator to locate points on chart
 * @param {BoundingBox} chartDrawingZone the chart drawing zone
 * @param {DatasetLegendConfiguration} legendConfiguration the configuration of the dataset's legend
 * @return {void}
 */
export const renderDatasetLegend = (svg, points, pointLocator, chartDrawingZone, legendConfiguration) => {
    if (!points.length) {
        return;
    }

    const { text } = legendConfiguration;

    // For now, dataset position is only top-end
    const lastPoint = points[points.length - 1];
    const left = Math.min(pointLocator.getX(lastPoint) - DATASET_MARGIN, chartDrawingZone.left + chartDrawingZone.width);
    const top = Math.max(pointLocator.getY(lastPoint) - DATASET_MARGIN, chartDrawingZone.top);

    select(svg)
        .append('text')
        .text(text)
        .attr('text-anchor', 'end')
        .attr('fill', 'black')
        .attr('stroke', 'white')
        .attr('paint-order', 'stroke')
        .attr('stroke-width', '5')
        .attr('font-size', FONT_SIZE)
        .attr('transform', `translate(${left}, ${top})`);
};
