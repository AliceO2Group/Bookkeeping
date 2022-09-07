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

const { Op } = require('sequelize');
const { COSMIC_OR_PHYSICS_TF_BUILDER_MODE } = require('../../../../services/getRunDefinition.js');

/**
 * Return the `include` sequelize expression to include "almost" physics runs
 *
 * The runs are included if they respect all the physics runs criteria EXCEPT for the stable beam condition.
 * It is required to check that later on, because for now it is not possible to add the stable beam condition inside the run's include expression
 */
const physicsRunsIncludeExpression = {
    association: 'runs',
    where: {
        dcs: true,
        dd_flp: true,
        epn: true,
        triggerValue: 'CTP',
        tfbDdMode: { [Op.or]: COSMIC_OR_PHYSICS_TF_BUILDER_MODE },
        pdpWorkflowParameters: { [Op.like]: '%CTF%' },
        detectors: {
            [Op.or]: [
                { [Op.like]: '%ITS%' },
                { [Op.like]: '%FT0%' },
            ],
        },
    },
    required: false,
};

exports.physicsRunsIncludeExpression = physicsRunsIncludeExpression;
