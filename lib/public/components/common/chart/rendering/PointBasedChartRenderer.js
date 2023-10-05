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

import { pointer, quadtree, scaleLinear, scalePoint, select } from '/assets/d3.min.js';
import { ChartRenderer } from './ChartRenderer.js';
import { renderDatasetAsLine } from './dataset/renderDatasetAsLine.js';
import { renderDatasetAsPointCloud } from './dataset/renderDatasetAsPointCloud.js';

/**
 * @typedef PointBasedChartDatasetConfiguration
 * @property {PointCloudGraphConfiguration} [point] the configuration of the points display
 * @property {LineGraphConfiguration} [line] the configuration of lines between points display
 */

/**
 * @typedef {ChartConfiguration<PointBasedChartDatasetConfiguration>} PointBasedChartConfiguration
 * @property {number} [pointHoverMargin] the margin applied to match hovered points in the chart
 */

const DEFAULT_POINT_HOVER_MARGIN = 20;

/**
 * Chart renderer to render point based charts
 */
export class PointBasedChartRenderer extends ChartRenderer {
    /**
     * Constructor
     *
     * @param {PointBasedChartConfiguration} configuration the chart configuration
     * @param {(Point[])} points the list of points to draw. If datasets configuration is an array, each point is
     *     expected to have an array as y value, one per dataset
     * @param {function} [onPointHover] function called when a point is hovered, with the point domain coordinates as first parameter and the
     *     point's absolute coordinates (in pixels from the top left of the screen) as second parameter
     */
    constructor(configuration, points, onPointHover) {
        super(configuration);

        this._pointHoverMargin = configuration.pointHoverMargin || DEFAULT_POINT_HOVER_MARGIN;
        this._points = points;
        this.computeRanges();

        this._computeHoveredPoint = new Array(this._datasets.length).fill(0);
        this._onPointHover = onPointHover;
    }

    /**
     * Update the ranges according to the chart points
     *
     * @return {void}
     */
    computeRanges() {
        this._xRange = { min: this._points[0].x, max: this._points[0].x };
        const isXNumeric = typeof this._xRange.min === 'number';
        // If x-axis are not numbers, consider them to be ordered
        if (!isXNumeric) {
            this._xRange.max = this._points[this._points.length - 1].x;
        }

        /**
         * Vertical range is specific for each dataset
         * @type {Range[]}
         */
        this._yDatasetsRanges = new Array(this._datasets.length)
            .fill({ min: Infinity, max: -Infinity });

        for (const point of this._points) {
            if (isXNumeric) {
                this._xRange.min = Math.min(this._xRange.min, point.x);
                this._xRange.max = Math.max(this._xRange.max, point.x);
            }

            for (const datasetIndex in this._yDatasetsRanges) {
                const y = this._stackedY ? point.y[datasetIndex] : point.y;
                this._yDatasetsRanges[datasetIndex].min = Math.min(this._yDatasetsRanges[datasetIndex].min, y);
                this._yDatasetsRanges[datasetIndex].max = Math.max(this._yDatasetsRanges[datasetIndex].max, y);
            }
        }

        // eslint-disable-next-line prefer-destructuring
        this._yRange = this._yDatasetsRanges[0];
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    computeScales() {
        this._xScale = scalePoint(
            this._points.map(({ x }) => x),
            [this._chartDrawingZone.left, this._chartDrawingZone.width + this._chartDrawingZone.left],
        );

        this._yScale = scaleLinear(
            [this._yRange.max, this._yRange.min],
            [this._chartDrawingZone.top, this._chartDrawingZone.height + this._chartDrawingZone.top],
        );
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    renderDataset(datasetIndex, svg) {
        const datasetYScale = scaleLinear(
            [this._yDatasetsRanges[datasetIndex].max, this._yDatasetsRanges[datasetIndex].min],
            [this._chartDrawingZone.top, this._chartDrawingZone.height + this._chartDrawingZone.top],
        );

        /** @type {PointLocator} */
        const pointLocator = {
            getX: ({ x }) => this.xScale(x),
            getY: this._stackedY ? ({ y }) => datasetYScale(y[datasetIndex]) : ({ y }) => datasetYScale(y),
        };

        const { line: lineConfiguration, point: pointConfiguration } = this._datasets[datasetIndex] || {};

        // Display datasets

        // Display line
        if (lineConfiguration) {
            renderDatasetAsLine(svg, this._points, this._xRange, this._yDatasetsRanges[datasetIndex], pointLocator, lineConfiguration);
        }

        // Display point cloud
        if (pointConfiguration) {
            renderDatasetAsPointCloud(svg, this._points, pointLocator, pointConfiguration);
        }

        const datasetQuadtree = quadtree()
            .x(pointLocator.getX)
            .y(pointLocator.getY)
            .addAll(this._points);

        /**
         * Compute the point hovered by the mouse and call the onPointHover function accordingly
         *
         * @param {MouseEvent} event an event to find the mouse position
         * @return {{coordinates: (Point | null), relativePosition: (Point|undefined)}} the hovered point if it applies, else null
         */
        this._computeHoveredPoint[datasetIndex] = (event) => {
            const [x, y] = pointer(event);
            const point = datasetQuadtree.find(
                x,
                y,
                this._pointHoverMargin,
            );
            if (point === undefined) {
                this._onPointHover(point);
                return { coordinates: null };
            }

            return { coordinates: point, relativePosition: { x: pointLocator.getX(point), y: pointLocator.getY(point) } };
        };
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    registerEvents(svg) {
        select(svg).on('mousemove', (event) => {
            for (const datasetIndex in this._datasets) {
                const { coordinates, relativePosition } = this._computeHoveredPoint[datasetIndex](event);
                if (!coordinates) {
                    // No points found in this dataset
                    continue;
                }

                const { left, top } = svg.getBoundingClientRect();

                const xWindowScale = scaleLinear(
                    [this._chartDrawingZone.left, this._chartDrawingZone.width + this._chartDrawingZone.left],
                    [left + this._chartDrawingZone.left, left + this._chartDrawingZone.left + this._chartDrawingZone.width],
                );
                const yWindowScale = scaleLinear(
                    [this._chartDrawingZone.top, this._chartDrawingZone.height + this._chartDrawingZone.top],
                    [top + this._chartDrawingZone.top, top + this._chartDrawingZone.top + this._chartDrawingZone.height],
                );

                this._onPointHover(coordinates, [xWindowScale(relativePosition.x), yWindowScale(relativePosition.y)]);
                break;
            }
        });
    }
}
