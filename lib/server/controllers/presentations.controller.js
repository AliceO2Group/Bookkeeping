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

const { dtos: { CreatePresentationDto } } = require('../../domain');
const { dtoValidator } = require('../utilities');
const { generatePresentation } = require('../services/presentation/generatePresentation.js');

/**
 * Generate a PDF using the signed-in user's Bookkeeping identity.
 *
 * @param {object} request The HTTP request.
 * @param {object} response The HTTP response.
 * @returns {Promise<void>} Resolves once the response has been sent.
 */
exports.createPresentation = async (request, response) => {
    response.set('Cache-Control', 'no-store');
    const { token } = request.query;
    const author = request.session?.name?.trim();
    if (typeof token !== 'string' || !token || !request.session?.username || !author) {
        response.status(401).json({
            errors: [{ status: 401, title: 'Sign-in required', detail: 'Sign in to Bookkeeping to generate a presentation.' }],
        });
        return;
    }

    const value = await dtoValidator(CreatePresentationDto, request, response);
    if (!value) {
        return;
    }

    const { status, pdf, filename, title, detail, retryAfter } = await generatePresentation(value.body, author, token);
    if (status === 200) {
        response.attachment(filename).send(pdf);
        return;
    }

    if (retryAfter) {
        response.set('Retry-After', retryAfter);
    }
    response.status(status).json({ errors: [{ status, title, detail }] });
};
