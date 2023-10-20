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

import { format, scaleLinear } from '/assets/d3.min.js';
import { ChartRenderer } from './ChartRenderer.js';
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
        this._histogram = histogram;

        this.computeRanges();
    }

    /**
     * Update the ranges according to the chart points
     *
     * @return {void}
     */
    computeRanges() {
        // Set the initial value for xRange
        this._xRange = {
            min: this._histogram.min,
            max: this._histogram.max,
        };

        // Set the initial value for yRange
        this._yRange = {
            min: this._forceZero ? 0 : Infinity,
            max: this._forceZero ? 0 : -Infinity,
        };

        // Set the initial value for dataset-specific yRange
        /**
         * Vertical range is specific for each dataset
         * @type {Range[]}
         */
        this._yDatasetsRanges = new Array(this._datasets.length).fill({ ...this._yRange });

        for (const histogramBin of this._histogram.bins) {
            // Update the yRange
            const sum = this._stackedY ? histogramBin.count.reduce((acc, count) => acc + count, 0) : histogramBin.count;

            this._yRange.min = Math.min(this._yRange.min, sum);
            this._yRange.max = Math.max(this._yRange.max, sum);
        }
    }

    // eslint-disable-next-line valid-jsdoc
    /**
     * @inheritDoc
     */
    computeScales() {
        this._xScale = scaleLinear(
            [this._xRange.min, this._xRange.max],
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
            [this._yRange.max, this._yRange.min],
            [this._chartDrawingZone.top, this._chartDrawingZone.height + this._chartDrawingZone.top],
        );

        /** @type {PointLocator} */
        const pointLocator = {
            getX: ({ offset }) => this.xScale(offset),
            getY: this._stackedY ? ({ count }) => datasetYScale(count[datasetIndex]) : ({ count }) => datasetYScale(count),
        };

        // Display datasets
        renderDatasetAsHistogram(svg, this._histogram, this._chartDrawingZone, pointLocator, this._datasets[datasetIndex]);
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
