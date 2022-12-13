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
 * Returns the given date formatted in two parts, YYYY-MM-DD and HH:MM to fill in HTML date and time inputs
 *
 * @param {Date} date the date to parse
 *
 * @return {{date: string, time: string}} the date expression
 */
export const formatDateForHTMLInput = (date) => {
    const [dateExpression] = date.toISOString().split('T');
    const hours = `${date.getHours()}`.padStart(2, '0');
    const minutes = `${date.getHours()}`.padStart(2, '0');
    const timeExpression = `${hours}:${minutes}`;

    return { date: dateExpression, time: timeExpression };
};
