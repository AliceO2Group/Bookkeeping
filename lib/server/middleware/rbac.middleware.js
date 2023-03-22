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

/**
 * Role based access control middleware generator
 *
 * Given a list of roles, generate a middleware that will check if the authenticated user have at least one of the specified roles to continue.
 * If not, a 403 exception is returned
 *
 * @param {string[]} roles the list of roles to check
 * @return {(function(*, *, *): void)} the rbac middleware
 */
exports.rbacMiddleware = (roles) => (request, response, next) => {
    let userRoles = request?.session?.access || [];

    if (!Array.isArray(userRoles)) {
        userRoles = [userRoles];
    }

    if (userRoles.some((userRole) => roles.includes(userRole))) {
        next();
    } else {
        response.status(403).json({
            errors: [{ status: '403', title: 'Access denied' }],
        });
    }
};
