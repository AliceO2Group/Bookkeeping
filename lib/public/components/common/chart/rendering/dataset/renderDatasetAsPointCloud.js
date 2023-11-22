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
import { getUniqueId } from '../../../../../utilities/getUniqueId.js';

/**
 * @typedef PointCloudGraphConfiguration
 * @property {number} [radius] the radius of points
 * @property {string} [fill] the fill color of the points
 */

const DEFAULT_POINT_RADIUS = 3;

const DEFAULT_POINT_FILL = 'none';

/**
 * Render a dataset as point cloud
 *
 * @param {SVGElement} svg the svg in which the point cloud must be displayed
 * @param {Point[]} points the dataset to display
 * @param {PointLocator} pointLocator locator to compute the points coordinates
 * @param {BoundingBox} chartDrawingZone the chart drawing zone outside which points are not rendered
 * @param {PointCloudGraphConfiguration} configuration the graph configuration
 * @return {void}
 */
export const renderDatasetAsPointCloud = (
    svg,
    points,
    pointLocator,
    chartDrawingZone,
    configuration,
) => {
    const { radius = DEFAULT_POINT_RADIUS, fill = DEFAULT_POINT_FILL } = configuration;

    const clipPath = getUniqueId();
    select(svg).append('clipPath')
        .attr('id', clipPath)
        .append('rect')
        .attr('x', chartDrawingZone.left - radius)
        .attr('y', chartDrawingZone.top - radius)
        .attr('width', chartDrawingZone.width + 2 * radius)
        .attr('height', chartDrawingZone.height + 2 * radius)
        .attr('fill', 'none');

    select(svg)
        .append('g')
        .attr('clip-path', `url(#${clipPath})`)
        .selectAll('circle')
        .data(points)
        .join('circle')
        .attr('cx', pointLocator.getX)
        .attr('cy', pointLocator.getY)
        .attr('r', radius)
        .attr('fill', fill);
};
