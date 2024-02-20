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

const { models: { LhcFill }, sequelize } = require('../');

const Repository = require('./Repository');
const { timestampToMysql } = require('../../server/utilities/timestampToMysql.js');
const { QueryTypes } = require('sequelize');

/**
 * Return the SQL query to use to fetch the list of LHC fills numbers that are in the given period
 *
 * @param {Period} period the restriction period
 * @return {string} the query
 */
const getFillNumbersEndedInPeriodQuery = (period) => `
    SELECT fill_number
    FROM (SELECT fill_number,
                 LAG(created_at, 1) OVER w AS stop
          FROM lhc_fills
          WINDOW w AS (ORDER BY created_at DESC)) lhc_fills_with_stop
    WHERE stop >= '${timestampToMysql(period.from)}' && stop < '${timestampToMysql(period.to)}'
`;

/**
 * Sequelize implementation of the RunRepository.
 */
class LhcFillRepository extends Repository {
    /**
     * Creates a new `RunRepository` instance.
     */
    constructor() {
        super(LhcFill);
    }

    /**
     * Return the list of fill numbers for fills that ended in the given period
     *
     * @param {Period} period the restriction period
     * @return {Promise<number[]>} the list of run numbers
     */
    async getFillNumbersEndedInPeriods(period) {
        return (await sequelize.query(getFillNumbersEndedInPeriodQuery(period), { type: QueryTypes.SELECT, raw: true }))
            .map(({ fill_number }) => Number.parseInt(fill_number, 10));
    }
}

module.exports = new LhcFillRepository();
