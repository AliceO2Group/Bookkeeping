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

import { select, scaleLinear, scalePoint } from '/assets/d3.min.js';
import { renderVerticalAxis } from '../rendering/renderVerticalAxis.js';
import { renderHorizontalAxis } from '../rendering/renderHorizontalAxis.js';
import { renderDatasetAsLine } from '../rendering/datasetRendering/renderDatasetAsLine.js';
import { renderDatasetAsPointCloud } from '../rendering/datasetRendering/renderDatasetAsPointCloud.js';

const DEFAULT_CHART_MARGIN = {
    left: 30,
    top: 15,
    right: 15,
    bottom: 30,
};

/**
 * @typedef LineChartDatasetConfiguration
 * @property {PointCloudGraphConfiguration} [point] the points display configuration
 * @property {LineGraphConfiguration} [line] the line's configuration
 */

/**
 * @typedef LineChartConfiguration
 * @property {LineChartDatasetConfiguration|LineChartDatasetConfiguration[]} [datasets] dataset specific configuration. If a point represents
 *     several values at the same time, this property must be an array with the same dimensions as the point's values. For example, if a data
 *     points have 3 y values, datasets must be an array of 3 values
 * @property {{left?: number, top?: number, right?: number, bottom?: number}} [chartMargins] the margins of the chart relative to the svg
 *     borders
 * @property {number} [axisLabelMargin] the margin to leave between each axis labels before dropping some of them
 * @property {object} [axis] the axis configuration
 * @property {AxisConfiguration} [axis.x] the horizontal axis configuration
 */

/**
 * Render the given line chart
 *
 * @param {SVGElement} svg the svg in which graph should be displayed
 * @param {(Point[])} points the list of points coordinates to draw. If datasets configuration is an array, each point is expected to have an
 *     array as y value, one per dataset
 * @param {LineChartConfiguration} configuration configuration of the line chart
 * @return {void}
 */
export const renderLineChart = (
    svg,
    points,
    configuration,
) => {
    const {
        chartMargins: configurationChartMargins = {},
        axis = {},
        datasets: configurationDatasets = {},
    } = configuration;
    const stackedY = Array.isArray(configurationDatasets);
    const datasets = stackedY ? configurationDatasets : [configurationDatasets];
    const datasetsCount = datasets.length;

    const chartMargins = {
        left: configurationChartMargins.left || DEFAULT_CHART_MARGIN.left,
        top: configurationChartMargins.top || DEFAULT_CHART_MARGIN.top,
        right: configurationChartMargins.right || DEFAULT_CHART_MARGIN.right,
        bottom: configurationChartMargins.bottom || DEFAULT_CHART_MARGIN.bottom,
    };

    const d3Svg = select(svg);

    const width = svg.clientWidth;
    const height = svg.clientHeight;

    // Adapt SVG view to the dom element
    d3Svg.attr('width', width)
        .attr('height', height);

    /**
     * @type {BoundingBox}
     */
    const chartDrawingZone = {
        left: chartMargins.left,
        top: chartMargins.top,
        width: width - chartMargins.left - chartMargins.right,
        height: height - chartMargins.top - chartMargins.bottom,
    };

    // Reset the SVG
    svg.innerHTML = '';

    /**
     * Horizontal range is global to all datasets
     * @type {Range}
     */
    const xRange = { min: points[0].x, max: points[0].x };

    /**
     * Vertical range is specific for each dataset
     * @type {Range[]}
     */
    const yRanges = new Array(datasetsCount)
        .fill({ min: Infinity, max: -Infinity });

    for (const point of points) {
        xRange.min = Math.min(xRange.min, point.x);
        xRange.max = Math.max(xRange.max, point.x);
        for (const datasetIndex in yRanges) {
            const y = stackedY ? point.y[datasetIndex] : point.y;
            yRanges[datasetIndex].min = Math.min(yRanges[datasetIndex].min, y);
            yRanges[datasetIndex].max = Math.max(yRanges[datasetIndex].max, y);
        }
    }

    const xScale = scalePoint(points.map(({ x }) => x), [
        chartDrawingZone.left,
        chartDrawingZone.width + chartDrawingZone.left,
    ]);

    for (let datasetIndex = 0; datasetIndex < datasetsCount; datasetIndex++) {
        const yScale = scaleLinear(
            [yRanges[datasetIndex].max, yRanges[datasetIndex].min],
            [chartDrawingZone.top, chartDrawingZone.height + chartDrawingZone.top],
        );

        /** @type {PointLocator} */
        const pointLocator = {
            getX: ({ x }) => xScale(x),
            getY: stackedY ? ({ y }) => yScale(y[datasetIndex]) : ({ y }) => yScale(y),
        };

        const { line: lineConfiguration = {}, point: pointConfiguration = {} } = datasets[datasetIndex] || {};

        // Display datasets

        // Display line
        renderDatasetAsLine(svg, points, xRange, yRanges[datasetIndex], pointLocator, lineConfiguration);

        // Display point cloud
        renderDatasetAsPointCloud(svg, points, pointLocator, pointConfiguration);

        // Display axis
        renderVerticalAxis(svg, yScale, chartDrawingZone);
        renderHorizontalAxis(svg, xScale, chartDrawingZone, axis.x);
    }
};
