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
 * @callback pointToCoordinate
 * @param {Point} point the point to convert to a coordinate
 * @return {number} the resulting coordinate
 */

/**
 * @typedef PointLocator
 * @property {pointToCoordinate} getX function to extract the horizontal coordinate of a given point
 * @property {pointToCoordinate} getY function to extract the vertical coordinate of a given point
 */
