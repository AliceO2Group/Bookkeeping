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

import { frontLink } from '../../components/common/navigation/frontLink.js';
import { ShowType } from '../../domain/enums/ShowType.js';
import { rbacShowComponent } from './rbacComponentShowType.js';
import { h } from '/js/src/index.js';

/**
 * Return a link, a disabled button, or a null object based on the user's access roles.
 * If the content of the component is a vnode, include a 'title' attribute that matches rbac.js.
 * If the component is a button not a link (e.g. 'Open filters'), set the isLink attribute to false.
 * Include formatting as a class, rather than directly in a vnode component.
 *
 * @param {String[]} roles the access roles the user has
 * @param {String} permissionsObject the permissions for the component
 * @param {String|vnode} content the text or h component to display
 * @param {String} toPage the href for the link
 * @param {Object} parameters optional parameters for the href
 * @param {Object} attributes attributes, such as class, id, onclick, isLink
 * @returns {frontLink|vnode|null} the component to display based on rbac
 */
export const linkOrDisabledOrNull = (roles, permissionsObject, content, toPage = '', parameters = {}, attributes = {}) => {
    // Decide how to show the component, based on the roles
    const showType = rbacShowComponent(roles, permissionsObject);

    if (showType === ShowType.SHOW) {
        // If a component isn't a link (e.g. open a dropdown menu), display as a button not a link
        const displayAsButton = !attributes?.isLink || false;
        delete attributes['isLink'];

        if (displayAsButton) {
            return h('button', attributes, content);
        } else {
            return frontLink(content, toPage, parameters, attributes);
        }
    } else if (showType === ShowType.DISABLED) {
        // Convert btn-<type> to btn-<type>[disabled]
        const disableableButtons = ['btn-primary', 'btn-warning', 'btn-danger', 'btn-success'];
        const disabledClassAttrs = attributes
            ?.class
            ?.split(' ')
            .map((attr) => disableableButtons.includes(attr) ? `${attr}[disabled]` : attr)
            .join(' ') || '';
        attributes.class = disabledClassAttrs;
        attributes.disabled = true;

        return h('button', attributes, content);
    } else {
        return null;
    }
};
