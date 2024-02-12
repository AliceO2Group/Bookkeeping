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
 * @callback BarToProperty
 * @param {Bar} bar
 * @return {string|number} bar property
 */

/**
 * @typedef BarPropertiesProvider
 * @type {VisualPropertiesProvider}
 * @property {BarToProperty} getX function to extract the horizontal coordinate of a given bar
 * @property {BarToProperty} getY function to extract the vertical coordinate of a given bar
 * @property {BarToProperty} getLength function to extract the length (size along dependent variable axis) of a given bar
 * @property {BarToProperty} getWidth function to extract the width (size along independent variable axis) of a given bar
 */
