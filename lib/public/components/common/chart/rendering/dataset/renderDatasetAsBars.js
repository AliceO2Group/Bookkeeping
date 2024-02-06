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
 * @typedef BarGraphConfiguration
 * @property {string} [stroke] the stroke color of the bar
 * @property {string} [fill] the fill color of the bar
 */

/**
 * Render a list of points as a line graph (eventually filled)
 *
 * @param {SVGElement} svg the svg in which graph must be rendered
 * @param {Point[]} points the points to display
 * @param {number} barWidth the width of bars to display
 * @param {BoundingBox} chartDrawingZone the chart drawing zone
 * @param {PointLocator} pointDataProvide locator to compute the points coordinates
 * @param {BarGraphConfiguration} [configuration] the bar graph configuration
 * @return {void}
 */
export const renderDatasetAsBars = (
    svg,
    points,
    barWidth,
    chartDrawingZone,
    pointDataProvide,
    configuration,
) => {
    const { fill, stroke, rotate } = configuration;

    if (!rotate) {
        select(svg)
            .append('g')
            .selectAll('rect')
            .data(points)
            .join('rect')
            .attr('width', barWidth)
            .attr('height', (point) => chartDrawingZone.top + chartDrawingZone.height - pointDataProvide.getY(point))
            .attr('x', pointDataProvide.getX)
            .attr('y', pointDataProvide.getY)
            .attr('fill', fill ?? 'none')
            .attr('stroke', stroke ?? 'none');
    } else {
        select(svg)
            .append('g')
            .selectAll('rect')
            .data(points)
            .join('rect')
            .attr('width', pointDataProvide.getX)
            .attr('height', chartDrawingZone.height / points.length)
            .attr('x', chartDrawingZone.left)
            .attr('y', pointDataProvide.getY)
            .attr('fill', pointDataProvide.getFill ?? fill ?? 'none')
            .attr('stroke', stroke ?? 'none');
    }
};
