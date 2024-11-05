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

import { ChartRenderer } from './ChartRenderer.js';
import { renderDatasetAsBars } from './dataset/renderDatasetAsBars.js';

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
     * @param {Bar[]} bars the bars to render
     */
    constructor(configuration, bars) {
        super(configuration, bars);

        if (this._stackedDependent) {
            throw new Error('Bar chart not implemented for stacked values');
        }

        /**
         * Get bar length - size along axis of dependent variable
         * @param {Bar} bar bar
         * @return {number} bar length
         */
        const getBarLength = ({ x, y }) => {
            if (this.isXIndependentVariable) {
                if (Array.isArray(y)) {
                    throw new Error('Range and stacked bars not implemented for independent variable \'x\'');
                }
                return this._chartDrawingZone.top + this._chartDrawingZone.height - this.yScale(y);
            } else if (Array.isArray(x)) { // Independent variable is 'y'
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
        };

        /**
         * Get bars thickness - size along axis of independnet variable
         * @return {number} thickness of bars
         */
        const getBarThickness = () => this.independentVariableScale.bandwidth();

        /**
         * @type {BarPropertiesProvider}
         */
        this._barPropertiesProvider = {
            getX: ({ x }) => {
                if (this.isXIndependentVariable) {
                    return this.xScale(x);
                } else if (Array.isArray(x)) { // (this._independentVariable === 'y')
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
            },
            getY: ({ y }) => {
                if (this.isXIndependentVariable) {
                    if (Array.isArray(y)) {
                        throw new Error('Range and stacked bars not implemented for independent variable \'x\'');
                    }
                }
                return this.yScale(y);
            },
            getWidth: this.isXIndependentVariable
                ? getBarThickness
                : getBarLength,
            getHeight: this.isXIndependentVariable
                ? getBarLength
                : getBarThickness,
        };
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
            barConfiguration,
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
