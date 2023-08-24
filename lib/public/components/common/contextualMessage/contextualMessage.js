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

import { h, iconWarning, info } from '/js/src/index.js';

const typeToIcon = {
    info: info,
    warning: iconWarning,
};

const typeToColor = {
    info: 'primary',
};

/**
 * Wrap a given content as a contextual info
 *
 * @param {'info'|'warning'} type the type of the contextual message
 * @param {Component} content the content of the contextual message
 * @return {vnode} the resulting component
 */
export const contextualMessage = (type, content) => {
    const color = typeToColor[type] || type;
    return h(
        '.ph2.pv1.flex-row.g2.items-center',
        [
            h(
                `.contextual-message-icon.br-pill.b-${color}.${color}.flex-row.items-center.justify-center`,
                typeToIcon[type](),
            ),
            h('.gray-darker', content),
        ],
    );
};

/**
 * Wrap a given content as a contextual info
 *
 * @param {Component} content the content of the contextual info
 * @return {vnode} the resulting component
 */
export const contextualInfo = (content) => contextualMessage('info', content);

/**
 * Wrap a given content as a contextual warning
 *
 * @param {Component} content the content of the contextual info
 * @return {vnode} the resulting component
 */
export const contextualWarning = (content) => contextualMessage('warning', content);
