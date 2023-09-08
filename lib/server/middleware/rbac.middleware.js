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

const { Op } = require('sequelize');
const { DplDetectorRepository } = require('../../database/repositories/DetectorRepository.js');

/**
 * Role based access control middleware generator
 *
 * Given a list of roles, generate a middleware that will check if the authenticated user have at least one of the specified roles to continue.
 * If not, a 403 exception is returned
 *
 * @param {string|string[]} roles the list of roles to check, either as an array or as a comma separated list
 * @return {(function(*, *, *): void)} the rbac middleware
 */
exports.rbacMiddleware = (roles) => (request, response, next) => {
    let userRoles = request?.session?.access || [];

    if (!Array.isArray(userRoles)) {
        userRoles = userRoles.split(',').map((role) => role.trim());
    }

    if (userRoles.some((userRole) => roles.includes(userRole))) {
        next();
    } else {
        response.status(403).json({
            errors: [{ status: '403', title: 'Access denied' }],
        });
    }
};

/**
 * Role based access control middleware generator for routes that require detector-specific roles
 *
 * Given a list of roles, generate a middleware to check if the authenticated user has at least one of the specified roles to continue.
 * If not, a 403 exception is returned
 *
 * @param {String|String[]} roles the user's access roles
 * @returns {(function(*, *, *): void)} the rbac middleware
 */
exports.rbacMiddlewareDetectors = (roles) => async (request, response, next) => {
    let userRoles = request?.session?.access || [];

    if (!Array.isArray(userRoles)) {
        userRoles = userRoles.split(',').map((role) => role.trim());
    }

    if (userRoles.some((userRole) => roles.includes(userRole))) {
        next();
        return;
    }

    // eslint-disable-next-line require-jsdoc
    const isDetectorRole = (role) => Boolean(role.match(/det-[a-z]+/g));
    // eslint-disable-next-line require-jsdoc
    const extractDetectorFromRole = (role) => /det-([a-z]+)/g.exec(role)?.[1];

    const usersEditableDetectors = userRoles.filter(isDetectorRole).map(extractDetectorFromRole);
    const detectorQualitiesAreBeingChanged = request?.body?.detectorsQualities?.length > 0;

    if (detectorQualitiesAreBeingChanged) {
        const ids = request.body.detectorsQualities.map((detector) => detector.detectorId);
        const names = (await DplDetectorRepository.findAll({ where: { id: { [Op.in]: ids } } })).map(({ name }) => name.toLowerCase());
        const userEditingBannedDetector = names.some((name) => !usersEditableDetectors.includes(name));
        if (!userEditingBannedDetector) {
            next();
            return;
        }
    }
    response.status(403).json({
        errors: [{ status: '403', title: 'Access denied' }],
    });
};
