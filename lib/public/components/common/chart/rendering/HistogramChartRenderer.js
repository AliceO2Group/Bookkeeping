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

import { format } from '/assets/d3.min.js';
import { ChartRenderer, RangeBasedScaleFactory } from './ChartRenderer.js';
import { renderDatasetAsHistogram } from './dataset/renderDatasetAsHistogram.js';

/**
 * @typedef HistogramDatasetConfiguration
 * @property {string} [fill] the fill color of the dataset
 * @property {string} [stroke] the stoke color of the dataset
 */

/**
 * @typedef {ChartConfiguration<HistogramDatasetConfiguration>} HistogramChartConfiguration
 */

/**
 * Chart renderer to render histograms
 */
export class HistogramChartRenderer extends ChartRenderer {
    /**
     * Constructor
     *
     * @param {HistogramChartConfiguration} configuration the chart configuration
     * @param {Histogram} histogram the histogram to render
     */
    constructor(configuration, histogram) {
        super(configuration);

        if (this._stackedY) {
            throw new Error('Histogram not implemented for stacked values');
        }

        this._histogram = histogram;

        const { y: { min: yMin, max: yMax } } = this.getAxisConfiguration();
        this._xAxisScaleFactory = new RangeBasedScaleFactory({ forceRange: { min: histogram.min, max: histogram.max } });
        const yAxisScaleFactoryConfiguration = { forceRange: { min: yMin, max: yMax } };
        if (this._forceZero) {
            yAxisScaleFactoryConfiguration.minimalRange = { min: 0, max: 0 };
        }
        this._yAxisScaleFactory = new RangeBasedScaleFactory(yAxisScaleFactoryConfiguration);

        for (const histogramBin of histogram.bins) {
            this._yAxisScaleFactory.processValue?.(histogramBin.count);
        }

        this._refreshScales();
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    renderDataset(datasetIndex, svg) {
        /** @type {PointLocator} */
        const pointLocator = {
            getX: ({ offset }) => this.xScale(offset),
            getY: ({ count }) => this.yScale(count),
        };

        // Display datasets
        renderDatasetAsHistogram(svg, this._histogram, this._chartDrawingZone, pointLocator, this._datasets[datasetIndex]);
    }

    /**
     * Return the scale factory for the x-axis
     *
     * @return {RangeBasedScaleFactory} the scale factory
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

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    getAxisConfiguration() {
        const { x, y } = super.getAxisConfiguration();

        return {
            x: {
                ...x,
                ticks: {
                    ...x.ticks,
                    filter: Number.isInteger,
                    format: x.ticks && x.ticks.format || format('d'),
                },
            },
            y: {
                ...y,
                ticks: {
                    ...y.ticks,
                    filter: Number.isInteger,
                    format: y.ticks && y.ticks.format || format('d'),
                },
            },
        };
    }
}
