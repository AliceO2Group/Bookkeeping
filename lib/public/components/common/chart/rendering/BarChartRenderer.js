/*
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

import { polygonContains } from '/assets/d3.min.js';
import { ChartRenderer } from './ChartRenderer.js';
import { renderDatasetAsBars } from './dataset/renderDatasetAsBars.js';

const DEFAULT_POINT_HOVER_MARGIN = 50;

/**
 * @typedef BarChartDatasetConfiguration
 * @property {BarGraphConfiguration} [bar] the bar graph configuration
 */

/**
 * @typedef {ChartConfiguration<BarChartDatasetConfiguration>} BarChartConfiguration
 */

/**
 * Chart renderer to render bar chart
 */
export class BarChartRenderer extends ChartRenderer {
    /**
     * Constructor
     *
     * @param {BarChartConfiguration} configuration the chart configuration
     * @param {Bar[]} data the bars to render
     */
    constructor(configuration, data) {
        super(configuration, data);
        this._pointHoverMargin = configuration.pointHoverMargin || DEFAULT_POINT_HOVER_MARGIN;

        if (this._stackedDependent) {
            throw new Error('Bar chart not implemented for stacked values');
        }

        /**
         * Get bar length
         * @param {Bar} bar bar
         * @return {number} bar length
         */
        const getBarLength = ({ x, y }) => {
            if (this._independentVariable === 'x') {
                if (Array.isArray(y)) {
                    throw new Error('Range and stacked bars not implemented for independent variable \'x\'');
                }
                return this._chartDrawingZone.top + this._chartDrawingZone.height - this.yScale(y);
            } else { // (this._independentVariable === 'y')
                if (Array.isArray(x)) {
                    if (!this._stackedDependent) {
                        if (x.length === 2) {
                            return this.xScale(x[1]) - this.xScale(x[0]);
                        } else {
                            throw new Error('For range bars you need to provide array of two numbers');
                        }
                    } else {
                        throw new Error('Bar chart not implemented for stacked values');
                    }
                } else {
                    return this.xScale(x);
                }
            }
        };

        /**
         * Get bars thickness
         * @return {number} thickness of bars
         */
        const getBarThickness = () => this.independentVariableScale.bandwidth();

        /**
         * @type {BarPropertiesProvider}
         */
        this._barPropertiesProvider = {
            getX: ({ x }) => {
                if (this._independentVariable === 'x') {
                    return this.xScale(x);
                } else { // (this._independentVariable === 'y')
                    if (Array.isArray(x)) {
                        if (!this._stackedDependent) {
                            if (x.length === 2) {
                                return this.xScale(x[0]);
                            } else {
                                throw new Error('For range bars you need to provide array of two numbers');
                            }
                        } else {
                            throw new Error('Bar chart not implemented for stacked values');
                        }
                    } else {
                        return this._chartDrawingZone.left;
                    }
                }
            },
            getY: ({ y }) => {
                if (this._independentVariable === 'x') {
                    if (Array.isArray(y)) {
                        throw new Error('Range and stacked bars not implemented for independent variable \'x\'');
                    }
                }
                return this.yScale(y);
            },
            getWidth: this._independentVariable === 'x'
                ? getBarThickness
                : getBarLength,
            getHeight: this._independentVariable === 'x'
                ? getBarLength
                : getBarThickness,
            getFill: ({ fill }) => fill,
            getStroke: ({ stroke }) => stroke,
        };
    }

    /**
     * Calculate nodes of area covered by given bar
     * @param {Point} bar bar definition
     * @return {[number, number][]} polygon
     */
    _barToPolygon(bar) {
        const x = this._barPropertiesProvider.getX(bar);
        const y = this._barPropertiesProvider.getY(bar);
        const w = this._barPropertiesProvider.getWidth(bar);
        const h = this._barPropertiesProvider.getHeight(bar);
        return [
            [x, y],
            [x + w, y],
            [x + w, y + h],
            [x, y + h],
        ];
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    updateChartDrawingZone(patch) {
        super.updateChartDrawingZone(patch);
        this._data.forEach((bar) => {
            bar.polygon = this._barToPolygon(bar);
        });
    }

    /**
     * Returns the coordinates of the point hovered (with a margin) by the cursor
     *
     * @param {Point} cursor the cursor position relatively to the chart SVG
     * @return {{coordinates: Point, relativePosition: Point}|null} the domain coordinates and the position relatively to the svg of the
     * hovered point (if any)
     */
    getHoveredBar({ x, y }) {
        const bar = this._data.find((bar) => polygonContains(bar.polygon, [x, y]));
        return { bar, relativePosition: { x, y } };
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    renderDataset(datasetIndex, svg) {
        const { bar: barConfiguration } = this._datasets[datasetIndex] || {};

        // Display datasets
        renderDatasetAsBars(
            svg,
            this._data,
            this._barPropertiesProvider,
            {
                ...barConfiguration,
                independentVariable: this._independentVariable,
            },
        );
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    get isPoint() {
        return false;
    }
}
