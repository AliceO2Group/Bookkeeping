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

import { h } from '@aliceo2/web-ui-frontend';

/**
 * Returns a component centered in its parent
 *
 * @param {Component} children the children of the centered component
 * @return {Component} the resulting component
 */
export const centeredComponent = (children) => h('.w-100.h-100.flex-row.items-center.justify-center', children);
