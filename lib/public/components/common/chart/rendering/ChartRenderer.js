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

import { select, scaleLinear, scaleBand, scalePoint } from '/assets/d3.min.js';
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
 * @callback PointProjector
 * @template T
 * @param {Point} point the point to project
 * @return {T} the point's projection
 */

export const X_AXIS_NAME = 'x';
export const Y_AXIS_NAME = 'y';

/**
 * Base class for any chart rendering class
 */
export class ChartRenderer {
    /**
     * Constructor
     * @template T
     *
     * @param {ChartConfiguration<T>} configuration the chart's configuration
     * @param {(DrawableData[])} data the data to draw.
     * If datasets configuration is an array:
     * - and if index axis is 'x' then each point is expected to have an array as y value, one per dataset
     * - and if index axis is 'y', 'x' must contain an array in the same manner
     */
    constructor(configuration, data) {
        if (!data?.length) {
            throw new Error('The data list can not be empty');
        }
        this._data = data;

        const {
            chartMargins: configurationChartMargins = {},
            forceZero = false,
            axis = {},
            indexAxis = X_AXIS_NAME,
            renderGrid = true,
            datasets: configurationDatasets = {},
        } = configuration;

        if (indexAxis !== X_AXIS_NAME && indexAxis !== Y_AXIS_NAME) {
            throw new Error(`Index axis can be only '${X_AXIS_NAME}' or '${Y_AXIS_NAME}'` +
                `, it cannot be '${this._indexAxis}'`);
        }
        this._indexAxis = indexAxis;

        this._renderGrid = renderGrid;

        // Configuration

        this._chartMargins = {
            left: !isNaN(configurationChartMargins.left) ? configurationChartMargins.left : DEFAULT_CHART_MARGIN.left,
            top: !isNaN(configurationChartMargins.top) ? configurationChartMargins.top : DEFAULT_CHART_MARGIN.top,
            right: !isNaN(configurationChartMargins.right) ? configurationChartMargins.right : DEFAULT_CHART_MARGIN.right,
            bottom: !isNaN(configurationChartMargins.bottom) ? configurationChartMargins.bottom : DEFAULT_CHART_MARGIN.bottom,
        };

        this._forceZero = forceZero;
        this._stackedValues = Array.isArray(configurationDatasets);
        this._datasets = this._stackedValues ? configurationDatasets : [configurationDatasets];

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

        const valueAxis = this.isXIndexAxis ? Y_AXIS_NAME : X_AXIS_NAME;
        const { [valueAxis]: {
            min: valueAxisMin,
            max: valueAxisMax,
        } } = this.getAxisConfiguration();

        const indexAxisScaleFactory = new EnumerableBasedScaleFactory({ point: this.isPoint });
        const valueAxisScaleFactoryConfiguration = { forceRange: { min: valueAxisMin, max: valueAxisMax } };
        if (this._forceZero) {
            valueAxisScaleFactoryConfiguration.minimalRange = { min: 0, max: 0 };
        }
        const valueAxisScaleFactory = new RangeBasedScaleFactory(valueAxisScaleFactoryConfiguration);

        for (const point of data) {
            indexAxisScaleFactory.processValue?.(point[indexAxis]);

            if (Array.isArray(point[valueAxis])) {
                for (const value of point[valueAxis]) {
                    valueAxisScaleFactory.processValue?.(value);
                }
            } else {
                valueAxisScaleFactory.processValue?.(point[valueAxis]);
            }
        }

        if (this.isXIndexAxis) {
            this._xAxisScaleFactory = indexAxisScaleFactory;
            this._yAxisScaleFactory = valueAxisScaleFactory;
        } else {
            this._xAxisScaleFactory = valueAxisScaleFactory;
            this._yAxisScaleFactory = indexAxisScaleFactory;
        }

        this._refreshScales();
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

        this.updateChartDrawingZone({
            left: this._chartMargins.left,
            top: this._chartMargins.top,
            width: width - this._chartMargins.left - this._chartMargins.right,
            height: height - this._chartMargins.top - this._chartMargins.bottom,
        });

        const { x: xAxisConfiguration, y: yAxisConfiguration } = this.getAxisConfiguration();

        const xAxisRenderer = new BottomAxisRenderer(svg, 'x-axis', xAxisConfiguration);
        const yAxisRenderer = new LeftAxisRenderer(svg, 'y-axis', yAxisConfiguration);

        // Display axis

        // Render the vertical axis a first time, to compute its width
        {
            const { width } = yAxisRenderer.render(this.yScale, this._chartDrawingZone);

            // Update the chart drawing zone considering the vertical axis width
            this.updateChartDrawingZone({
                left: this._chartDrawingZone.left + width,
                width: this._chartDrawingZone.width - width,
            });
        }

        // Render the horizontal axis
        {
            const { height } = xAxisRenderer.render(this.xScale, this._chartDrawingZone);

            // Update the chart drawing zone considering the horizontal axis height
            this.updateChartDrawingZone({ height: this._chartDrawingZone.height - height });
        }

        for (let datasetIndex = 0; datasetIndex < this._datasets.length; datasetIndex++) {
            this.renderDataset(datasetIndex, svg);
        }

        xAxisRenderer.render(this.xScale, this._chartDrawingZone);
        yAxisRenderer.render(this.yScale, this._chartDrawingZone);

        // Render the horizontal grid
        if (this._renderGrid) {
            renderHorizontalGrid(yAxisRenderer.getCurrentAxis(), this._chartDrawingZone.width);
        }

        this.registerEvents(svg);
    }

    /**
     * Update the chart drawing zone
     *
     * @param {Partial<BoundingBox>} patch the patch to apply to the chart drawing zone
     * @return {void}
     */
    updateChartDrawingZone(patch) {
        this._chartDrawingZone = {
            ...this._chartDrawingZone,
            ...patch,
        };
        this._refreshScales();
    }

    /**
     * Return the scale factory for the x-axis
     *
     * @return {EnumerableBasedScaleFactory|RangeBasedScaleFactory} the scale factory - enumerable scale if x is index axis, range otherwise
     */
    get xAxisScaleFactory() {
        return this._xAxisScaleFactory;
    }

    /**
     * Return the scale factory for the y-axis
     *
     * @return {RangeBasedScaleFactory|EnumerableBasedScaleFactory} the scale factory - range scale if y is value axis, enumerable otherwise
     */
    get yAxisScaleFactory() {
        return this._yAxisScaleFactory;
    }

    /**
     * States if the points are rendered as points or bars
     */
    get isPoint() {
        throw new Error('Abstract function call');
    }

    /**
     * Render the given dataset
     *
     * @param {number} datasetIndex the index of the dataset being rendered
     * @param {SVGElement} svg the SVG in which the element should be rendered
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
        return this._xScale;
    }

    /**
     * Returns the current y-axis scale
     *
     * @return {d3.AxisScale} the scale
     */
    get yScale() {
        return this._yScale;
    }

    /**
     * Returns the current index-axis scale
     *
     * @return {d3.AxisScale} the scale
     */
    get indexAxisScale() {
        return this.isXIndexAxis ? this._xScale : this._yScale;
    }

    /**
     * States whether x is index variable
     *
     * @return {boolean} true if x is index axis, false otherwise
     */
    get isXIndexAxis() {
        return this._indexAxis === X_AXIS_NAME;
    }

    /**
     * Recompute the scales with the current chart drawing zone
     *
     * @return {void}
     * @protected
     */
    _refreshScales() {
        this._xScale = this.xAxisScaleFactory.getScale([
            this._chartDrawingZone.left,
            this._chartDrawingZone.width + this._chartDrawingZone.left,
        ]);

        this._yScale = this.yAxisScaleFactory.getScale([
            this._chartDrawingZone.height + this._chartDrawingZone.top,
            this._chartDrawingZone.top,
        ]);
    }
}

/**
 * Class storing an axis defined by a range (a min and a max value)
 */
class RangeBasedScaleFactory {
    /**
     * Constructor
     * @param {Object} [configuration] the scale factory configuration
     * @param {NumericRange} [configuration.minimalRange] if specified, scale domain is forced to these values
     * @param {NumericRange} [configuration.forceRange] if specified, scale domain will at least include those two values
     */
    constructor(configuration) {
        const { forceRange = {}, minimalRange = {} } = configuration || {};
        this.processValue = null;

        if (forceRange.min !== undefined && forceRange.max !== undefined) {
            this._min = forceRange.min;
            this._max = forceRange.max;
        } else if (forceRange.min !== undefined) {
            this._min = forceRange.min;
            this._max = minimalRange.max === undefined ? -Infinity : minimalRange.max;
            this.processValue = (value) => {
                this._max = Math.max(this._max, value);
            };
        } else if (forceRange.max !== undefined) {
            this._min = minimalRange.min === undefined ? Infinity : minimalRange.min;
            this._max = forceRange.max;
            this.processValue = (value) => {
                this._min = Math.min(this._min, value);
            };
        } else {
            this._min = minimalRange.min === undefined ? Infinity : minimalRange.min;
            this._max = minimalRange.max === undefined ? -Infinity : minimalRange.max;
            this.processValue = (value) => {
                this._min = Math.min(this._min, value);
                this._max = Math.max(this._max, value);
            };
        }
    }

    /**
     * Return the scale adapted to the given range
     * @param {[number, number]} range the destination range
     * @return {d3.AxisScale} the scale
     */
    getScale(range) {
        return scaleLinear([this._min, this._max], range);
    }
}

/**
 * Class storing an axis representing a list of distinct points
 */
class EnumerableBasedScaleFactory {
    /**
     * Constructor
     * @param {object} [configuration] the scale factory configuration
     * @param {boolean} [configuration.point] if true, scale will represent a list of points, else it will represent a range
     */
    constructor(configuration) {
        const { point } = configuration || [];
        this._scaleAsPoint = Boolean(point);
        this._values = [];
        this.processValue = (value) => {
            this._values.push(value);
        };
    }

    /**
     * Return the scale adapted to the given range
     * @param {[number, number]} range the destination range
     * @return {d3.AxisScale} the scale
     */
    getScale(range) {
        return this._scaleAsPoint ? scalePoint(this._values, range) : scaleBand(this._values, range);
    }
}
