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

import { select, scaleLinear, scalePoint, quadtree, pointer } from '/assets/d3.min.js';
import { renderDatasetAsLine } from '../rendering/dataset/renderDatasetAsLine.js';
import { renderDatasetAsPointCloud } from '../rendering/dataset/renderDatasetAsPointCloud.js';
import { BottomAxisRenderer } from '../rendering/axis/BottomAxisRenderer.js';
import { LeftAxisRenderer } from '../rendering/axis/LeftAxisRenderer.js';
import { renderHorizontalGrid } from '../rendering/grid/renderHorizontalGrid.js';

const DEFAULT_CHART_MARGIN = {
    left: 15,
    top: 15,
    right: 15,
    bottom: 15,
};

const DEFAULT_POINT_HOVER_MARGIN = 20;

/**
 * @typedef LineChartDatasetConfiguration
 * @property {PointCloudGraphConfiguration} [point] the points display configuration
 * @property {LineGraphConfiguration} [line] the line's configuration
 */

/**
 * @callback formatAxisTick
 * @param {number} domainValue the domain value of the axis tick
 * @return {string|number} the tick value
 */

/**
 * @typedef LineChartConfiguration
 * @property {LineChartDatasetConfiguration|LineChartDatasetConfiguration[]} [datasets] dataset specific configuration. If a point represents
 *     several values at the same time, this property must be an array with the same dimensions as the point's values. For example, if a data
 *     points have 3 y values, datasets must be an array of 3 values
 * @property {{left?: number, top?: number, right?: number, bottom?: number}} [chartMargins] the margins of the chart relative to the svg
 *     borders
 * @property {number} [pointHoverMargin] the margin applied to match hovered points in the chart
 * @property {object} [axis] the axis configuration
 * @property {AxisConfiguration} [axis.x] the horizontal axis configuration
 * @property {AxisConfiguration} [axis.y] the horizontal axis configuration
 */

/**
 * Render the given line chart
 *
 * @param {SVGElement} svg the svg in which graph should be displayed
 * @param {(Point[])} points the list of points coordinates to draw. If datasets configuration is an array, each point is expected to have an
 *     array as y value, one per dataset
 * @param {function} [onPointHover] function called when a point is hovered, with the point domain coordinates as first parameter and the
 *     point's absolute coordinates (in pixels from the top left of the screen) as second parameter
 * @param {LineChartConfiguration} configuration configuration of the line chart
 * @return {void}
 */
export const renderLineChart = (
    svg,
    points,
    onPointHover,
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
        left: !isNaN(configurationChartMargins.left) ? configurationChartMargins.left : DEFAULT_CHART_MARGIN.left,
        top: !isNaN(configurationChartMargins.top) ? configurationChartMargins.top : DEFAULT_CHART_MARGIN.top,
        right: !isNaN(configurationChartMargins.right) ? configurationChartMargins.right : DEFAULT_CHART_MARGIN.right,
        bottom: !isNaN(configurationChartMargins.bottom) ? configurationChartMargins.bottom : DEFAULT_CHART_MARGIN.bottom,
    };

    const pointHoverMargin = configuration.pointHoverMargin || DEFAULT_POINT_HOVER_MARGIN;

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

    const xAxisRenderer = new BottomAxisRenderer(svg, 'x-axis', axis.x);
    const yAxisRenderer = new LeftAxisRenderer(svg, 'y-axis', axis.y);

    // Display axis
    let yScale = scaleLinear([yRanges[0].max, yRanges[0].min], [chartDrawingZone.top, chartDrawingZone.height + chartDrawingZone.top]);
    // Render the vertical axis a first time, to compute its width
    {
        const { width } = yAxisRenderer.render(yScale, chartDrawingZone);

        // Update the chart drawing zone considering the vertical axis width
        chartDrawingZone.left += width;
        chartDrawingZone.width -= width;
    }

    let xScale = scalePoint(points.map(({ x }) => x), [chartDrawingZone.left, chartDrawingZone.width + chartDrawingZone.left]);

    // Render the horizontal axis
    {
        const { height } = xAxisRenderer.render(xScale, chartDrawingZone);

        // Update the chart drawing zone considering the horizontal axis height
        chartDrawingZone.height -= height;
    }

    const computeHoveredPoint = new Array(datasetsCount).fill(0);

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

        const datasetQuadtree = quadtree()
            .x(pointLocator.getX)
            .y(pointLocator.getY)
            .addAll(points);

        const { line: lineConfiguration = {}, point: pointConfiguration = {} } = datasets[datasetIndex] || {};

        // Display datasets

        // Display line
        renderDatasetAsLine(svg, points, xRange, yRanges[datasetIndex], pointLocator, lineConfiguration);

        // Display point cloud
        renderDatasetAsPointCloud(svg, points, pointLocator, pointConfiguration);

        /**
         * Compute the point hovered by the mouse and call the onPointHover function accordingly
         *
         * @param {MouseEvent} event an event to find the mouse position
         * @return {{coordinates: (Point | null), relativePosition: (Point|undefined)}} the hovered point if it applies, else null
         */
        computeHoveredPoint[datasetIndex] = (event) => {
            const [x, y] = pointer(event);
            const point = datasetQuadtree.find(
                x,
                y,
                pointHoverMargin,
            );
            if (point === undefined) {
                onPointHover(point);
                return { coordinates: null };
            }

            return { coordinates: point, relativePosition: { x: pointLocator.getX(point), y: pointLocator.getY(point) } };
        };
    }

    // Re-render the axis using the new chart drawing zone, at the end to be displayed on top of the chart itself
    xScale = scalePoint(points.map(({ x }) => x), [chartDrawingZone.left, chartDrawingZone.width + chartDrawingZone.left]);
    xAxisRenderer.render(xScale, chartDrawingZone);

    yScale = scaleLinear([yRanges[0].max, yRanges[0].min], [chartDrawingZone.top, chartDrawingZone.height + chartDrawingZone.top]);
    yAxisRenderer.render(yScale, chartDrawingZone);

    // Render the horizontal grid
    renderHorizontalGrid(yAxisRenderer.getCurrentAxis(), chartDrawingZone.width);

    select(svg)
        .on('mousemove', (event) => {
            for (const datasetIndex in datasets) {
                const { coordinates, relativePosition } = computeHoveredPoint[datasetIndex](event);
                if (!coordinates) {
                    // No points found in this dataset
                    continue;
                }

                const { left, top } = svg.getBoundingClientRect();

                const xWindowScale = scaleLinear(
                    [chartDrawingZone.left, chartDrawingZone.width + chartDrawingZone.left],
                    [left + chartDrawingZone.left, left + chartDrawingZone.left + chartDrawingZone.width],
                );
                const yWindowScale = scaleLinear(
                    [chartDrawingZone.top, chartDrawingZone.height + chartDrawingZone.top],
                    [top + chartDrawingZone.top, top + chartDrawingZone.top + chartDrawingZone.height],
                );

                onPointHover(coordinates, [xWindowScale(relativePosition.x), yWindowScale(relativePosition.y)]);
                break;
            }
        });
};
