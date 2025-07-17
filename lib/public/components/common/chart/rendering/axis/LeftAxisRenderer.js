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

import { AxisRenderer } from './AxisRenderer.js';
import { axisLeft } from '/assets/d3.min.js';

/**
 * Implementation of {@see AxisRenderer} to display a vertical axis at the left of a chart
 */
export class LeftAxisRenderer extends AxisRenderer {
    /**
     * @inheritDoc
     */
    getTicksAndLineRenderer(scale) {
        return axisLeft(scale);
    }

    /**
     * @inheritDoc
     */
    getTicksAndLinePosition(chartDrawingZone) {
        return { x: chartDrawingZone.left, y: 0 };
    }

    /**
     * @inheritDoc
     */
    getTicksRestrictedDimension(dimensions) {
        return dimensions.height;
    }

    /**
     * @inheritDoc
     */
    getLabelPosition(lineAndTicksBoundingBox, chartDrawingZone) {
        const labelX = chartDrawingZone.left - lineAndTicksBoundingBox.width - this.configuration.gap;
        const labelY = chartDrawingZone.top + chartDrawingZone.height / 2;

        return { x: labelX, y: labelY };
    }

    /**
     * @inheritDoc
     */
    getLabelDominantBaseline() {
        return 'text-after-edge';
    }

    /**
     * @inheritDoc
     */
    getLabelRotation() {
        return -90;
    }
}
