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
     * @param {Point[]} points the points to render
     */
    constructor(configuration, points) {
        super(configuration, points);

        if (this._stackedDependent) {
            throw new Error('Bar chart not implemented for stacked values');
        }

        this._barsDataProvider = {
            getX: ({ x }) => {
                if (this._independentVariable === 'y') {
                    return Array.isArray(x)
                        ? this.xScale(x[0])
                        : this._chartDrawingZone.left;
                } else if (this._independentVariable === 'x') {
                    return this.xScale(x);
                } else {
                    throw new Error(`Independent variable can be only 'x' or 'y', it cannot be ${this._independentVariable}`);
                }
            },
            getY: ({ y }) => {
                if (this._independentVariable === 'x' && Array.isArray(y) && this._stackedDependent) {
                    throw new Error('Hadnling bottom aligned bars when independentVariable === \'x\' is not implemented');
                }
                return this.yScale(y);
            },
            getBarLength: ({ x, y }) => {
                if (this._independentVariable === 'y') {
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
                } else if (this._independentVariable === 'x') {
                    return this._chartDrawingZone.top + this._chartDrawingZone.height - this.yScale(y);
                } else {
                    throw new Error(`Independent variable can be only 'x' or 'y', it cannot be ${this._independentVariable}`);
                }
            },
            getFill: ({ fill }) => fill,
            getStroke: ({ stroke }) => stroke,
        };
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    renderDataset(datasetIndex, svg) {
        /** @type {PointLocator} */

        const { bar: barConfiguration } = this._datasets[datasetIndex] || {};

        // Display datasets
        renderDatasetAsBars(
            svg,
            this._points,
            this.independentVariableScale.bandwidth(),
            this._chartDrawingZone,
            this._barsDataProvider,
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
