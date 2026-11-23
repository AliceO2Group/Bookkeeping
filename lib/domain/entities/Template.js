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

/**
 * @typedef TemplateModule
 *
 * @property {number} position the position of the module in the presentation, starting at 0
 * @property {string} type the type of the module, as known by the generation service
 * @property {string|null} title the title of the module's slides
 * @property {Object} options the settings of the module
 */

/**
 * @typedef Template
 *
 * @property {number} id
 * @property {string} name the unique name of the template
 * @property {string} title the title of the presentations made with the template
 * @property {string|null} description
 * @property {TemplateModule[]} [modules] the modules of the template, in presentation order
 */
