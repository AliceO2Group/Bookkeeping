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

import { profiles } from '../components/common/table/profiles.js';

/**
 * Apply the given profile on the given subject, and return the resulting subject or null
 *
 * A subject may vary under a given profile or may not exist. This function will :
 *     - apply the override of the subject if there is specific properties values under the given profile and return the result
 *     - return the subject as is if the subject is simply allowed under the profile
 *     - return null if the subject must not be displayed under the given profile
 *
 * @template T
 * @param {T} subject the subject on which profile must be applied
 * @param {string|Symbol} profileToApply the profile to apply
 * @param {Object|(string|Symbol)[]} subjectProfiles the profiles configuration of the subject, which means how it behaves under specific
 *     profiles. It is either an Object to override subject properties under specific profiles, or an array of profiles to which subject is
 *     restricted
 * @return {null|T} the resulting subject (maybe override) or null if the subject is restricted to profiles that do not match the applied
 *     one
 */
export const applyProfile = (subject, profileToApply, subjectProfiles) => {
    // Subject is simply restricted to a profile list
    if (Array.isArray(subjectProfiles)) {
        if (subjectProfiles.includes(profileToApply)) {
            return subject;
        }
    } else {
        // No override, simply return the subject with its default values
        if (profileToApply === profiles.none) {
            return subject;
        }
        // We have subject override per profile
        for (const [profile, override] of Object.entries(subjectProfiles)) {
            if (profile === profileToApply) {
                return {
                    ...subject,
                    ...typeof override === 'object' ? override : {},
                };
            }
        }
    }
    return null;
};
