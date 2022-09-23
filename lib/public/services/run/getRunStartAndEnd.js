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
 * Returns the run start (timeTrgStart if it exists, else timeO2Start if it exists, else null) and end (timeTrgEnd if it exists, else timeO2End
 * if it exists, else null). Both values are timestamp in milliseconds
 *
 * @param {Run} run the run
 * @return {{start: (number|null), end: (number|null)}} the start and end
 */
export const getRunStartAndEnd = ({ timeTrgStart, timeO2Start, timeTrgEnd, timeO2End }) => ({
    start: timeTrgStart !== null ? timeTrgStart : timeO2Start,
    end: timeTrgEnd !== null ? timeTrgEnd : timeO2End,
});
