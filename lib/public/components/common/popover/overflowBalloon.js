/**
 * @license
 * Copyright CERN and copyright holders of ALICE O2. This software is
 * distributed under the terms of the GNU General Public License v3 (GPL
 * Version 3), copied verbatim in the file "COPYING".
 *
 * See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */
import { popover } from './popover.js';

/**
 * Return a component containing the given content, with a popover displayed on hover if the content overflow from its parent
 *
 * @param {vnode|string|Array} content the content of the component to create
 * @param {Object|null} [options=null] a restricted set of popover options
 * @param {boolean} [options.stretch=false] if true, the balloon will be displayed when hovering the element in which this component is displayed
 * @return {vnode} the component
 */
export const overflowBalloon = (content, options = null) => {
    const { stretch = false } = options || {};
    return popover(content, content, { stretch, overflowOnly: true });
};
