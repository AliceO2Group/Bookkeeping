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

import { quadtree } from 'd3';
import { ChartRenderer } from './ChartRenderer.js';
import { renderDatasetAsLine } from './dataset/renderDatasetAsLine.js';
import { renderDatasetAsPointCloud } from './dataset/renderDatasetAsPointCloud.js';
import { renderDatasetLegend } from './legend/renderDatasetLegend.js';

/**
 * @typedef LineChartDatasetConfiguration
 * @property {PointCloudGraphConfiguration} [point] the configuration of the points display
 * @property {LineGraphConfiguration} [line] the configuration of lines between points display
 * @property {number} min overrides the minimum value of the dataset
 * @property {number} max overrides the maximum value of the dataset
 */

/**
 * @typedef {ChartConfiguration<LineChartDatasetConfiguration>} LineChartConfiguration
 * @property {number} [pointHoverMargin] the margin applied to match hovered points in the chart
 */

const DEFAULT_POINT_HOVER_MARGIN = 20;

/**
 * Chart renderer to render line charts
 */
export class LineChartRenderer extends ChartRenderer {
    /**
     * Constructor
     *
     * @param {LineChartConfiguration} configuration the chart configuration
     * @param {(Point[])} points the list of points to draw. If datasets configuration is an array, each point is expected to have an array as y
     *     value, one per dataset
     */
    constructor(configuration, points) {
        super(configuration, points);

        this._pointHoverMargin = configuration.pointHoverMargin || DEFAULT_POINT_HOVER_MARGIN;
        this._computeHoveredPoint = new Array(this._datasets.length).fill(0);
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    get isPoint() {
        return true;
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

        const { line: lineConfiguration, point: pointConfiguration, legend: legendConfiguration } = this._datasets[datasetIndex] || {};

        // Display datasets

        const points = this._points.filter((point) => (pointLocator.getY(point) ?? null) !== null);

        // Display line
        if (lineConfiguration) {
            renderDatasetAsLine(
                svg,
                points.filter((point) => (pointLocator.getY(point) ?? null) !== null),
                pointLocator,
                this._chartDrawingZone,
                lineConfiguration,
            );
        }

        // Display point cloud
        if (pointConfiguration) {
            renderDatasetAsPointCloud(svg, points, pointLocator, this._chartDrawingZone, pointConfiguration);
        }

        // Display dataset legend
        if (legendConfiguration) {
            renderDatasetLegend(svg, points, pointLocator, this._chartDrawingZone, legendConfiguration);
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
