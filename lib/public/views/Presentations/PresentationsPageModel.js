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
import { fetchClient, Observable, RemoteData } from '/js/src/index.js';
import { TimeRangeInputModel } from '../../components/Filters/common/filters/TimeRangeInputModel.js';
import { getRemoteData } from '../../utilities/fetch/getRemoteData.js';

const GENERATION_FAILURE_TITLE = 'Could not generate the presentation';

/**
 * Store the form and the result of a presentation request.
 */
export class PresentationsPageModel extends Observable {
    /**
     * Set up the required period and empty form.
     */
    constructor() {
        super();
        this.timeRangeModel = new TimeRangeInputModel(null, null, { required: true });
        this.timeRangeModel.bubbleTo(this);
        this.timeRangeModel.visualChange$.bubbleTo(this);
        this.templates = RemoteData.notAsked();
        this.templateId = null;
        this.result = RemoteData.notAsked();
        this._generationRequest = null;
    }

    /**
     * Load the current list of predefined templates.
     * @return {Promise<void>} resolves once the list has loaded
     */
    async load() {
        if (this.templates.match({ Loading: () => true, Other: () => false })) {
            return;
        }

        this.templates = RemoteData.loading();
        this.notify();
        try {
            const { data: templates } = await getRemoteData('/api/presentationTemplates');
            this.templates = RemoteData.success(templates);
            if (!templates.some(({ id }) => id === this.templateId)) {
                this.templateId = null;
            }
        } catch (errors) {
            this.templates = RemoteData.failure(errors);
        }
        this.notify();
    }

    /**
     * Select a predefined template from the picker.
     * @param {string} value the chosen option's value
     * @return {void}
     */
    selectTemplate(value) {
        this.templateId = value ? Number(value) : null;
        this.notify();
    }

    /**
     * Return the selected time bounds as Unix milliseconds.
     * @return {Period} the chosen period
     */
    get period() {
        return { from: this.timeRangeModel.fromTimeInputModel.value, to: this.timeRangeModel.toTimeInputModel.value };
    }

    /**
     * Indicate whether a generation request is in progress.
     * @return {boolean} whether the request is in progress
     */
    get isGenerating() {
        return this._generationRequest !== null;
    }

    /**
     * Indicate whether the form can start generation.
     * @return {boolean} whether the complete form is ready
     */
    get canGenerate() {
        const { from, to } = this.period;
        const hasTemplate = this.templates.match({
            Success: (templates) => templates.some(({ id }) => id === this.templateId),
            Other: () => false,
        });
        return !this.isGenerating && hasTemplate && Number.isSafeInteger(from) && from >= 0 && Number.isSafeInteger(to) && from < to;
    }

    /**
     * Request the PDF from Bookkeeping and make it available for download.
     * @return {Promise<void>} resolves once generation succeeds or fails
     */
    async generate() {
        if (!this.canGenerate) {
            return;
        }

        this._releaseDownload();
        this._generationRequest = new AbortController();
        const { signal } = this._generationRequest;
        this.result = RemoteData.loading();
        this.notify();

        try {
            const response = await fetchClient('/api/presentations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ templateId: this.templateId, ...this.period }),
                signal,
            });
            if (!response.ok) {
                const body = await response.json().catch(() => null);
                if (!signal.aborted) {
                    this.result = RemoteData.failure(body?.errors ?? {
                        title: GENERATION_FAILURE_TITLE,
                        detail: body?.message ?? `Bookkeeping returned HTTP ${response.status}.`,
                    });
                }
                return;
            }

            if (response.headers.get('Content-Type')?.split(';')[0] !== 'application/pdf') {
                if (!signal.aborted) {
                    this.result = RemoteData.failure({ title: GENERATION_FAILURE_TITLE, detail: 'Bookkeeping did not return a PDF.' });
                }
                return;
            }

            const pdf = await response.blob();
            if (!signal.aborted) {
                const disposition = response.headers.get('Content-Disposition') ?? '';
                const fileName = /filename="([^"]+)"/i.exec(disposition)?.[1] ?? 'presentation.pdf';
                this.result = RemoteData.success({ url: URL.createObjectURL(pdf), fileName });
            }
        } catch {
            if (!signal.aborted) {
                this.result = RemoteData.failure({ title: GENERATION_FAILURE_TITLE, detail: 'Bookkeeping could not complete the request.' });
            }
        } finally {
            if (!signal.aborted) {
                this._generationRequest = null;
                this.notify();
            }
        }
    }

    /**
     * Discard the result and stop any active browser request when leaving the page.
     * @return {void}
     */
    close() {
        this._generationRequest?.abort();
        this._generationRequest = null;
        this._releaseDownload();
        this.result = RemoteData.notAsked();
    }

    /**
     * Release the current download URL when it is no longer needed.
     * @return {void}
     */
    _releaseDownload() {
        this.result.match({ Success: ({ url }) => URL.revokeObjectURL(url), Other: () => {} });
    }
}
