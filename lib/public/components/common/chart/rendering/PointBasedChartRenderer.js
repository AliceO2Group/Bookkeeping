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

import { quadtree } from '/assets/d3.min.js';
import { ChartRenderer, EnumerableBasedScaleFactory, RangeBasedScaleFactory } from './ChartRenderer.js';
import { renderDatasetAsLine } from './dataset/renderDatasetAsLine.js';
import { renderDatasetAsPointCloud } from './dataset/renderDatasetAsPointCloud.js';

/**
 * @typedef PointBasedChartDatasetConfiguration
 * @property {PointCloudGraphConfiguration} [point] the configuration of the points display
 * @property {LineGraphConfiguration} [line] the configuration of lines between points display
 * @property {number} min overrides the minimum value of the dataset
 * @property {number} max overrides the maximum value of the dataset
 */

/**
 * @typedef {ChartConfiguration<PointBasedChartDatasetConfiguration>} PointBasedChartConfiguration
 * @property {number} [pointHoverMargin] the margin applied to match hovered points in the chart
 */

/**
 * @callback PointProjector
 * @template T
 * @param {Point} point the point to project
 * @return {T} the point's projection
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
     */
    constructor(configuration, points) {
        super(configuration);
        if (!points.length) {
            throw new Error('The points list can not be empty');
        }

        this._pointHoverMargin = configuration.pointHoverMargin || DEFAULT_POINT_HOVER_MARGIN;
        this._points = points;

        const { y: { min: yMin, max: yMax } } = this.getAxisConfiguration();
        this._xAxisScaleFactory = new EnumerableBasedScaleFactory({ point: true });
        const yAxisScaleFactoryConfiguration = { forceRange: { min: yMin, max: yMax } };
        if (this._forceZero) {
            yAxisScaleFactoryConfiguration.minimalRange = { min: 0, max: 0 };
        }
        this._yAxisScaleFactory = new RangeBasedScaleFactory(yAxisScaleFactoryConfiguration);

        for (const point of points) {
            this._xAxisScaleFactory.processValue?.(point.x);
            if (this._stackedY) {
                for (const value of point.y) {
                    this._yAxisScaleFactory.processValue?.(value);
                }
            } else {
                this._yAxisScaleFactory.processValue?.(point.y);
            }
        }
        this._refreshScales();

        this._computeHoveredPoint = new Array(this._datasets.length).fill(0);
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    renderDataset(datasetIndex, svg) {
        /** @type {PointLocator} */
        const pointLocator = {
            getX: ({ x }) => this.xScale(x),
            getY: this._stackedY ? ({ y }) => this.yScale(y[datasetIndex]) : ({ y }) => this.yScale(y),
        };

        const { line: lineConfiguration, point: pointConfiguration } = this._datasets[datasetIndex] || {};

        // Display datasets

        const points = this._points.filter((point) => (pointLocator.getY(point) ?? null) !== null);

        // Display line
        if (lineConfiguration) {
            renderDatasetAsLine(
                svg,
                points.filter((point) => (pointLocator.getY(point) ?? null) !== null),
                this.xScale,
                this.yScale,
                pointLocator,
                this._chartDrawingZone,
                lineConfiguration,
            );
        }

        // Display point cloud
        if (pointConfiguration) {
            renderDatasetAsPointCloud(svg, points, pointLocator, this._chartDrawingZone, pointConfiguration);
        }

        const datasetQuadtree = quadtree()
            .x(pointLocator.getX)
            .y(pointLocator.getY)
            .addAll(this._points);

        /**
         * Compute the point hovered by the mouse and call the onPointHover function accordingly
         *
         * @param {Point} coords the mouse position relatively to the svg
         * @return {{coordinates: (Point | null), relativePosition: (Point|undefined)}} the hovered point if it applies, else null
         */
        this._computeHoveredPoint[datasetIndex] = ({ x, y }) => {
            const point = datasetQuadtree.find(
                x,
                y,
                this._pointHoverMargin,
            );
            if (point === undefined) {
                return { coordinates: null };
            }

            return { coordinates: point, relativePosition: { x: pointLocator.getX(point), y: pointLocator.getY(point) } };
        };
    }

    /**
     * Return the scale factory for the x-axis
     *
     * @return {EnumerableBasedScaleFactory} the scale factory
     */
    get xAxisScaleFactory() {
        return this._xAxisScaleFactory;
    }

    /**
     * Return the scale factory for the y-axis
     *
     * @return {RangeBasedScaleFactory} the scale factory
     */
    get yAxisScaleFactory() {
        return this._yAxisScaleFactory;
    }

    /**
     * Returns the coordinates of the point hovered (with a margin) by the cursor
     *
     * @param {Point} cursor the cursor position relatively to the chart SVG
     * @return {{coordinates: Point, relativePosition: Point}|null} the domain coordinates and the position relatively to the svg of the
     * hovered point (if any)
     */
    getHoveredPoint(cursor) {
        for (const datasetIndex in this._datasets) {
            const { coordinates, relativePosition } = this._computeHoveredPoint[datasetIndex](cursor);
            if (!coordinates) {
                // No points found in this dataset
                continue;
            }
            return { coordinates, relativePosition };
        }
        return null;
    }
}
