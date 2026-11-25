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

const { LogManager } = require('@aliceo2/web-ui');
const { ServicesConfig } = require('../../../config');

const logger = LogManager.getLogger('PRESENTATION-GENERATION');

const generationTimeout = 120_000;
const upstreamErrors = {
    401: { title: 'Session expired', detail: 'Sign in to Bookkeeping again and retry.' },
    422: { title: 'Invalid presentation', detail: 'Check the selected template and period and try again.' },
    502: { title: 'Data unavailable', detail: 'The generation service could not get the data for this presentation.' },
    503: { title: 'Generation busy', detail: 'A presentation is already being made. Try again shortly.' },
};
const unavailable = {
    status: 502,
    title: 'Generation failed',
    detail: 'The generation service could not return a PDF. Try again later.',
};

/**
 * Return the sentence with which ALICE Insights explains an error, or null if its answer has none.
 *
 * @param {Response} response The answer of ALICE Insights.
 * @returns {Promise<string|null>} The sentence.
 */
const readDetail = async (response) => {
    try {
        const { detail } = await response.json();
        return typeof detail === 'string' ? detail : null;
    } catch {
        return null;
    }
};

/**
 * Send a request to ALICE Insights and return a PDF or a safe error for the caller.
 *
 * ALICE Insights explains every error in a sentence written for the user, which never repeats a value of the request. That
 * sentence is passed on. Bookkeeping's own sentence is used when ALICE Insights gives none or cannot be reached.
 * The log has the answer of ALICE Insights for every request that gives no PDF.
 *
 * @param {object} selection The validated template and period.
 * @param {number} selection.templateId The selected template ID.
 * @param {number} selection.from Inclusive start of the reporting period in UTC milliseconds.
 * @param {number} selection.to Exclusive end of the reporting period in UTC milliseconds.
 * @param {string} author The signed-in user's name.
 * @param {string} token The signed-in user's Bookkeeping token.
 * @returns {Promise<object>} The PDF download or the response status, title and detail.
 */
exports.generatePresentation = async ({ templateId, from, to }, author, token) => {
    const { url } = ServicesConfig.aliceInsights;
    if (!url) {
        return {
            status: 503,
            title: 'Generation unavailable',
            detail: 'Presentation generation is not configured for this Bookkeeping server.',
        };
    }

    try {
        const response = await fetch(new URL('/presentations', url), {
            method: 'POST',
            headers: {
                Accept: 'application/pdf',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ templateId: String(templateId), from, to, author }),
            redirect: 'error',
            signal: AbortSignal.timeout(generationTimeout),
        });

        if (response.status !== 200) {
            const detail = await readDetail(response);
            logger.warnMessage(`ALICE Insights answered ${response.status} for template ${templateId}${detail ? `: ${detail}` : ''}`);
            const error = upstreamErrors[response.status];
            if (!error) {
                return unavailable;
            }
            const retryAfter = response.headers.get('retry-after');
            return {
                status: response.status,
                ...error,
                detail: detail ?? error.detail,
                retryAfter: response.status === 503 && /^\d+$/.test(retryAfter) ? retryAfter : null,
            };
        }

        if (response.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase() !== 'application/pdf') {
            await response.body?.cancel();
            logger.errorMessage('ALICE Insights answered 200 with something else than a PDF');
            return unavailable;
        }

        const pdf = Buffer.from(await response.arrayBuffer());
        if (pdf.subarray(0, 5).toString('latin1') !== '%PDF-') {
            logger.errorMessage('ALICE Insights answered 200 with a file that is not a PDF');
            return unavailable;
        }

        const disposition = response.headers.get('content-disposition');
        const filename = disposition?.match(/^attachment;\s*filename="([a-z0-9][a-z0-9._-]*\.pdf)"$/i)?.[1] ?? 'presentation.pdf';
        return { status: 200, pdf, filename };
    } catch (error) {
        // The address comes from the configuration and the error from the connection, so neither holds the user's token
        logger.errorMessage(`ALICE Insights could not be reached at ${url}: ${error.cause?.code ?? error.name}`);
        if (error.name === 'TimeoutError' || error.name === 'AbortError') {
            return {
                status: 504,
                title: 'Generation timed out',
                detail: 'The generation service took too long to finish. Try again later.',
            };
        }
        return unavailable;
    }
};
