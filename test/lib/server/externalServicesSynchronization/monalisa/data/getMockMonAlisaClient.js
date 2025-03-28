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

const { MonAlisaClient } = require('../../../../../../lib/server/externalServicesSynchronization/monalisa/MonAlisaClient.js');

const mockDataPasses = `# header
"LHC23f_apass1";" DESCRIPTION random random f b  DESCRIPTION SOME FOR";;;;;;;;;126100154;;;;83;;104191770775979
"LHC23f_skimming";"f c e g f d f PASS SOME";;;;;;;;;840807644;;;;56;;63273650813089
"LHC23f_apass3_skimmed";"b SOME e data  DESCRIPTION";;;;;;;;;343625859;;;;25;;42374130608446
"LHC23f_apass4_skimmed";"b random PASS data PASS a a SOME g";;;;;;;;;727348585;;;;70;;66705904497741
"LHC22b_apass4";"FOR SOME e c SOME f b";;;;;;;;;619030472;;;;52;;13169623613935
"LHC22a_npass8";"b random FOR e c  DESCRIPTION PASS SOME";;;;;;;;;58672533;;;;53;;59137757381106
"LHC22a_apass6";"SOME e g random  DESCRIPTION  DESCRIPTION SOME random data  DESCRIPTION c a";;;;;;;;;50948694;;;;16;;56875682112600
"LHC22a_dpass7";"PASS SOME  DESCRIPTION random a PASS SOME random SOME  DESCRIPTION SOME";;;;;;;;;752050617;;;;14;;134921884110451
"LHC22b_spass4";"SOME data random data a data random data  DESCRIPTION";;;;;;;;;804848472;;;;96;;9690175956847
"LHC22b_cpass1";"a random data PASS FOR c a data random random";;;;;;;;;796463715;;;;85;;90144966576290
"LHC23f_npass5";"b random PASS data PASS a a SOME";;;;;;;;;727348585;;;;70;;66705904497741
"LHC23f_gpass9";"a data e g  DESCRIPTION data";;;;;;;;;778108959;;;;95;;48044039184101
"LHC22a_epass3";"a b data SOME g FOR PASS f FOR  DESCRIPTION f a";;;;;;;;;732356113;;;;54;;44743842710266`;

const mockDescriptionToDataPassVersionDetails = require('./mockDescriptionToDataPassVersionDetails.json');
const mockSimulationPasses = require('./mockSimulationPasses.json');

exports.getMockMonAlisaClient = (yearLowerLimit) => {
    if (!yearLowerLimit) {
        throw new Error('Year limit not specified');
    }
    const instance = new MonAlisaClient({
        dataPassesUrl: 'https://some.mock.url.com',
        dataPassDetailsUrl: 'https://some.other.mock.url.com',
        yearLowerLimit,
    });
    instance._fetchDataPassesVersions = async () => mockDataPasses;
    instance._fetchDataPassVersionDetails = async (description) => mockDescriptionToDataPassVersionDetails[description];
    instance._fetchSimulationPasses = async () => mockSimulationPasses;
    return instance;
};
