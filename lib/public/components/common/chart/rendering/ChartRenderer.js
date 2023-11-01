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
import { BottomAxisRenderer } from './axis/BottomAxisRenderer.js';
import { LeftAxisRenderer } from './axis/LeftAxisRenderer.js';
import { renderHorizontalGrid } from './grid/renderHorizontalGrid.js';

const DEFAULT_CHART_MARGIN = {
    left: 15,
    top: 15,
    right: 15,
    bottom: 15,
};

/**
 * @template T
 * @typedef ChartConfiguration
 *
 * @property {T|T[]} dataset datasets configuration
 * @property {{left?: number, top?: number, right?: number, bottom?: number}} [chartMargins] the margins of the chart relative to the svg
 *     borders
 * @property {object} axis the axis configuration
 * @property {AxisConfiguration} axis.x the horizontal axis configuration
 * @property {AxisConfiguration} axis.y the horizontal axis configuration
 */

/**
 * Base class for any chart rendering class
 */
export class ChartRenderer {
    /**
     * Constructor
     * @template T
     *
     * @param {ChartConfiguration<T>} configuration the chart's configuration
     */
    constructor(configuration) {
        const {
            chartMargins: configurationChartMargins = {},
            forceZero = false,
            axis = {},
            datasets: configurationDatasets = {},
        } = configuration;

        // Configuration

        this._chartMargins = {
            left: !isNaN(configurationChartMargins.left) ? configurationChartMargins.left : DEFAULT_CHART_MARGIN.left,
            top: !isNaN(configurationChartMargins.top) ? configurationChartMargins.top : DEFAULT_CHART_MARGIN.top,
            right: !isNaN(configurationChartMargins.right) ? configurationChartMargins.right : DEFAULT_CHART_MARGIN.right,
            bottom: !isNaN(configurationChartMargins.bottom) ? configurationChartMargins.bottom : DEFAULT_CHART_MARGIN.bottom,
        };

        this._forceZero = forceZero;
        this._stackedY = Array.isArray(configurationDatasets);

        this._datasets = this._stackedY ? configurationDatasets : [configurationDatasets];

        this._axis = axis;

        // Set-up

        /**
         * @type {BoundingBox}
         */
        this._chartDrawingZone = {
            left: 0,
            top: 0,
            width: 0,
            height: 0,
        };

        /**
         * @type {Range}
         */
        this._xRange = { min: 0, max: 0 };

        /**
         * @type {Range}
         */
        this._yRange = { min: 0, max: 0 };

        /**
         * @type {Range[]}
         */
        this._yDatasetsRanges = [];

        /**
         * @type {d3.AxisScale|null}
         */
        this._xScale = null;

        /**
         * @type {d3.AxisScale|null}
         */
        this._yScale = null;
    }

    /**
     * Render the given histogram
     *
     * @param {SVGElement} svg the svg in which graph should be displayed
     * @return {void}
     */
    render(svg) {
        // Reset the SVG
        svg.innerHTML = '';

        const d3Svg = select(svg);

        const width = svg.clientWidth;
        const height = svg.clientHeight;

        // Adapt SVG view to the dom element
        d3Svg.attr('width', width)
            .attr('height', height);

        this._chartDrawingZone = {
            left: this._chartMargins.left,
            top: this._chartMargins.top,
            width: width - this._chartMargins.left - this._chartMargins.right,
            height: height - this._chartMargins.top - this._chartMargins.bottom,
        };

        this.computeScales();

        const { x: xAxisConfiguration, y: yAxisConfiguration } = this.getAxisConfiguration();

        const xAxisRenderer = new BottomAxisRenderer(svg, 'x-axis', xAxisConfiguration);
        const yAxisRenderer = new LeftAxisRenderer(svg, 'y-axis', yAxisConfiguration);

        // Display axis

        // Render the vertical axis a first time, to compute its width
        {
            const { width } = yAxisRenderer.render(this.yScale, this._chartDrawingZone);

            // Update the chart drawing zone considering the vertical axis width
            this._chartDrawingZone.left += width;
            this._chartDrawingZone.width -= width;
        }

        // Render the horizontal axis
        {
            const { height } = xAxisRenderer.render(this.xScale, this._chartDrawingZone);

            // Update the chart drawing zone considering the horizontal axis height
            this._chartDrawingZone.height -= height;
        }

        this.computeScales();

        for (let datasetIndex = 0; datasetIndex < this._datasets.length; datasetIndex++) {
            this.renderDataset(datasetIndex, svg);
        }

        xAxisRenderer.render(this.xScale, this._chartDrawingZone);
        yAxisRenderer.render(this.yScale, this._chartDrawingZone);

        // Render the horizontal grid
        renderHorizontalGrid(yAxisRenderer.getCurrentAxis(), this._chartDrawingZone.width);

        this.registerEvents(svg);
    }

    /**
     * Refresh the x and y scales to be adapted to the current ranges and chart drawing zone
     *
     * @return {void}
     */
    computeScales() {
        throw new Error('Abstract function call');
    }

    /**
     * Render the given dataset
     *
     * @param {number} datasetIndex the index of the dataset being rendered
     * @param {SVGElement} svg the SVG in which the element should be rendered
     * @param {{xScale: d3.AxisScale, yScale: d3.AxisScale}} scales the scales scale
     * @return {void}
     * @abstract
     */
    renderDataset(datasetIndex, svg) {// eslint-disable-line no-unused-vars
        throw new Error('Abstract function call');
    }

    /**
     * Register all the SVG events
     *
     * @param {SVGElement} svg the svg in which chart is being rendered
     * @return {void}
     */
    registerEvents(svg) {// eslint-disable-line no-unused-vars
        // By default, do nothing
    }

    /**
     * Returns the axis configuration
     *
     * @return {{x: AxisConfiguration, y: AxisConfiguration}} the axis configurations
     */
    getAxisConfiguration() {
        return this._axis;
    }

    /**
     * Returns the current x-axis scale
     *
     * @return {d3.AxisScale} the scale
     */
    get xScale() {
        if (!this._xScale) {
            throw new Error('X scale must be computed (call computeScales) before using it');
        }

        return this._xScale;
    }

    /**
     * Returns the current y-axis scale
     *
     * @return {d3.AxisScale} the scale
     */
    get yScale() {
        if (!this._yScale) {
            throw new Error('Y scale must be computed (call computeScales) before using it');
        }

        return this._yScale;
    }
}
