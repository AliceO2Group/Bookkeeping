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

import { select, line } from '/assets/d3.min.js';
import { getUniqueId } from '../../../../../utilities/getUniqueId.js';

/**
 * @typedef LineGraphConfiguration
 * @property {string} [stroke] the stroke color of the line
 * @property {string} [fill] the fill color of the area bellow the line
 */

/**
 * Render a list of points as a line graph (eventually filled)
 *
 * @param {SVGElement} svg the svg in which graph must be rendered
 * @param {Point[]} points the dataset to display
 * @param {d3.AxisScale} xScale the horizontal scale of the dataset
 * @param {d3.AxisScale} yScale the vertical scale of the dataset
 * @param {PointLocator} pointLocator locator to compute the points coordinates
 * @param {BoundingBox} chartDrawingZone the chart drawing zone outside which points are not rendered
 * @param {LineGraphConfiguration} [configuration] the line graph configuration
 * @return {void}
 */
export const renderDatasetAsLine = (
    svg,
    points,
    xScale,
    yScale,
    pointLocator,
    chartDrawingZone,
    configuration = {},
) => {
    const clipPath = getUniqueId();
    select(svg).append('clipPath')
        .attr('id', clipPath)
        .append('rect')
        .attr('x', chartDrawingZone.left)
        .attr('y', chartDrawingZone.top)
        .attr('width', chartDrawingZone.width)
        .attr('height', chartDrawingZone.height)
        .attr('fill', 'none');

    const path = select(svg)
        .append('path')
        .attr('clip-path', `url(#${clipPath})`);

    const pathDraw = line()
        .x(pointLocator.getX)
        .y(pointLocator.getY)(points);

    const xLeft = chartDrawingZone.left;
    const xRight = chartDrawingZone.left + chartDrawingZone.width;
    const yBottom = chartDrawingZone.top + chartDrawingZone.height;

    path.attr('d', `M${xLeft},${yBottom}L${pathDraw.substring(1)}L${xRight},${yBottom}`);

    if (configuration.stroke) {
        path.attr('stroke', configuration.stroke);
    }
    if (configuration.fill) {
        path.attr('fill', configuration.fill);
    } else {
        path.attr('fill', 'none');
    }
};
