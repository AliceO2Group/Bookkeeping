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
 * @param {Range} xRange the horizontal range of the dataset
 * @param {Range} yRange the vertical range of the dataset
 * @param {PointLocator} pointLocator locator to compute the points coordinates
 * @param {BoundingBox} chartDrawingZone the chart drawing zone outside which points are not rendered
 * @param {LineGraphConfiguration} [configuration] the line graph configuration
 * @return {void}
 */
export const renderDatasetAsLine = (
    svg,
    points,
    xRange,
    yRange,
    pointLocator,
    chartDrawingZone,
    configuration = {},
) => {
    let y = yRange.min;
    if (Array.isArray(points[points.length - 1].y)) {
        y = new Array(points[points.length - 1].y.length).fill(yRange.min);
    }
    const bottomLeftPoint = { x: xRange.min, y };
    const bottomRightPoint = { x: xRange.max, y };

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

    path.attr(
        'd',
        line()
            .x(pointLocator.getX)
            .y(pointLocator.getY)([
                // Add a point at the bottom left to have a proper fill
                bottomLeftPoint,
                ...points,
                // Add a point at the bottom right to have a proper fill
                bottomRightPoint,
            ]),
    );
    if (configuration.stroke) {
        path.attr('stroke', configuration.stroke);
    }
    if (configuration.fill) {
        path.attr('fill', configuration.fill);
    } else {
        path.attr('fill', 'none');
    }
};
