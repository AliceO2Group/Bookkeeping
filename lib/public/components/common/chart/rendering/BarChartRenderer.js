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

        if (this._stackedY) {
            throw new Error('Bar chart not implemented for stacked values');
        }

        this._pointLocator = {
            getX: ({ x }) => this._rotate
                ? (Array.isArray(x)
                    ? this.xScale(x[0])
                    : this._chartDrawingZone.left)
                : this.xScale(x),
            // getX: ({ x }) => this.xScale(x),
            getY: ({ y }) => this.yScale(y),
            getBarLength: ({ x }) => this._rotate
                ? Array.isArray(x)
                    ? this.xScale(x[1]) - this.xScale(x[0])
                    : this.xScale(x)
                : null,
            getFill: ({ fill }) => fill,
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
            this.xScale.bandwidth?.() ?? this.yScale.bandwidth?.(),
            this._chartDrawingZone,
            this._pointLocator,
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
