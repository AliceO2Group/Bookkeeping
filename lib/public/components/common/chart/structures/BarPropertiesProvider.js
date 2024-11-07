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
 * @callback ChartBarToChartBarProperty
 * @param {ChartBar} bar
 * @return {string|number|number[]} bar property
 */

/**
 * @typedef ChartBarPropertiesProvider
 * @property {ChartBarToChartBarProperty} getX function to get position along x-axis
 *  if x is independnet variable and horizontal boundary(-ies) otherwise
 * @property {ChartBarToChartBarProperty} getY function to get horizontal boundary(-ies) along y-axis
 *  if y is dependnet variable and position otherwise
 * @property {ChartBarToChartBarProperty} getHeight function to get the height (size along y-axis) of a given bar
 * @property {ChartBarToChartBarProperty} getWidth function to get the width (size along x-axis) of a given bar
 */
