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

import { h } from '/js/src/index.js';
import { CopyIdentifierComponent } from './CopyIdentifierComponent.js';

/**
 *  Renders a copyIdentifierButton component that copies the identifier to the clipboard.
 *
 * @param {string} key the key that specifies what identifier to copy
 * @param {string} value the value that specifies what identifier to copy
 * @return {vnode} the copyIdentifierButton component
 */
export const copyIdentifierButton = (key, value) =>
    h(CopyIdentifierComponent, { target: value }, `Copy ${key}`);
