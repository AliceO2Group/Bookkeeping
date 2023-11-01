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
 * @typedef LineGraphConfiguration
 * @property {string} [stroke] the stroke color of the line
 * @property {string} [fill] the fill color of the area bellow the line
 */

/**
 * Render a list of points as a line graph (eventually filled)
 *
 * @param {SVGElement} svg the svg in which graph must be rendered
 * @param {Histogram} histogram the histogram to display
 * @param {BoundingBox} chartDrawingZone the chart drawing zone
 * @param {PointLocator} pointLocator locator to compute the points coordinates
 * @param {HistogramDatasetConfiguration} [configuration] the line graph configuration
 * @return {void}
 */
export const renderDatasetAsHistogram = (
    svg,
    histogram,
    chartDrawingZone,
    pointLocator,
    configuration,
) => {
    const { fill, stroke } = configuration;

    const barWidth = chartDrawingZone.width / (histogram.max - histogram.min);

    select(svg)
        .append('g')
        .selectAll('rect')
        .data(histogram.bins)
        .join('rect')
        .attr('width', barWidth)
        .attr('height', (point) => chartDrawingZone.top + chartDrawingZone.height - pointLocator.getY(point))
        .attr('x', pointLocator.getX)
        .attr('y', pointLocator.getY)
        .attr('fill', fill ?? 'none')
        .attr('stroke', stroke ?? 'none');
};
