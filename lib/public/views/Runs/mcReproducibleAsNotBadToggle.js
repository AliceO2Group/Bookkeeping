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

import { switchInput } from '../../components/common/form/switchInput.js';
import { h } from '/js/src/index.js';

/**
 * Display a toggle switch to change interpretation of MC.Reproducible flag type from bad to not-bad
 *
 * @param {boolean} value current value
 * @param {function} onChange to be called when switching
 * @returns {Component} the toggle switch
 */
export const mcReproducibleAsNotBadToggle = (value, onChange) => h('#mcReproducibleAsNotBadToggle', switchInput(
    value,
    onChange,
    { labelAfter: h('em', 'MC.R as not-bad') },
));
