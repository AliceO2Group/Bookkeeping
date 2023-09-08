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
const { sequelize } = require('../../lib/database');


const getEscapedPastDate = (runNumber, dateNow) => `'${(new Date(dateNow - runNumber * 1000 * 60))
    .toISOString()
    .replace(/T/, ' ')
    .replace(/\..+/, '')  }'`;

/**
 * This var holds run_numbers which will have customized timestamps
 */
const runRunNumbersWithCustomizedTimestamps = [1, 2, 3, 4];

/**
 * Set timestamps (created_at and updated_at) for runs with run_number specified in variable @see runRunNumbersWithCustomizedTimestamps
 * according to formula `UPSERTED_TIMESTAMP = THIS_METHOD_CALL_TIME - run_number * 1000 * 60`
 * so there are time differences between the runs
 */
const setRunsTimestamps = async () => {
    const dateNow = Date.now();
    const dbPromises = runRunNumbersWithCustomizedTimestamps.map((runNumber) => 
        sequelize.query(`UPDATE runs 
            SET 
                created_at=${getEscapedPastDate(runNumber, dateNow)},
                updated_at=${getEscapedPastDate(runNumber, dateNow)} 
            WHERE run_number = ${runNumber}`))};

    return Promise.all(dbPromises);

module.exports = {
    runRunNumbersWithCustomizedTimestamps,
    setRunsTimestamps,
};
