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

import { quadtree, polygonContains } from '/assets/d3.min.js';
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
     * @param {Point[]} points the points to render
     */
    constructor(configuration, points) {
        super(configuration, points);
        this._pointHoverMargin = configuration.pointHoverMargin || DEFAULT_POINT_HOVER_MARGIN;

        if (this._stackedDependent) {
            throw new Error('Bar chart not implemented for stacked values');
        }

        /**
         * Get bar length
         * @param {Point} point point
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

        // eslint-disable-next-line require-jsdoc
        const barToPolygon = (p) => {
            if (this._independentVariable === 'y') {
                const x = this._barPropertiesProvider.getX(p);
                const y = this._barPropertiesProvider.getY(p);
                const l = this._barPropertiesProvider.getBarLength(p);
                const t = this._barPropertiesProvider.getBarThickness(p);
                const polygonDef = [
                    [x, y],
                    [x + l, y],
                    [x + l, y + t],
                    [x, y + t],
                ];
                return 
            }
        }

        /**
         * Compute the point hovered by the mouse and call the onPointHover function accordingly
         *
         * @param {Point} coords the mouse position relatively to the svg
         * @return {{coordinates: (Point | null), relativePosition: (Point|undefined)}} the hovered point if it applies, else null
         */
        this._computeHoveredPoint = ({ x, y }) => {
            window.qtc = quadtree;
            window.bpp = this._barPropertiesProvider;
            const datasetQuadtree = quadtree()
                .x(this._barPropertiesProvider.getX)
                .y(this._barPropertiesProvider.getY)
                .addAll(this._points);
            window.qtr = datasetQuadtree;
            window.p = this._points;

            console.log('_computeHoveredPoint', x, y, this._pointHoverMargin);
            const point = datasetQuadtree.find(
                x,
                y,
                this._pointHoverMargin,
            );
            console.log(point)

            if (point === undefined) {
                return { coordinates: null };
            }

            return {
                coordinates: point,
                relativePosition: {
                    x: point.x,
                    y: point.y,
                },
            };
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
        const { coordinates, relativePosition } = this._computeHoveredPoint(cursor);
        return { coordinates, relativePosition };
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
            this._points,
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
