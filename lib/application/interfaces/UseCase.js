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
 * The software in this layer contains application specific business rules. It encapsulates and implements all of the
 * use cases of the system. These use cases orchestrate the flow of data to and from the entities, and direct those
 * entities to use their enterprise wide business rules to achieve the goals of the use case.
 */
class UseCase {
    /**
     * Executes this use case.
     *
     * @returns {Promise} Promise object represents the result of this use case.
     */
    async execute() {
        return Promise.reject('The method or operation is not implemented.');
    }
}

module.exports = UseCase;
