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
 * @param {LineGraphConfiguration} [configuration] the line graph configuration
 * @return {void}
 */
export const renderDatasetAsLine = (
    svg,
    points,
    xRange,
    yRange,
    pointLocator,
    configuration = {},
) => {
    let y = yRange.min;
    if (Array.isArray(points[0].y)) {
        y = new Array(points[0].y.length).fill(yRange.min);
    }
    const bottomLeftPoint = { x: xRange.min, y };
    const bottomRightPoint = { x: xRange.max, y };

    select(svg).append('path')
        .attr(
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
        )
        .attr('stroke', configuration.stroke || 'black')
        .attr('fill', configuration.fill || 'none');
};
