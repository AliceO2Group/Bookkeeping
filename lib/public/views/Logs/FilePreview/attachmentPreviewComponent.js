/**
 *
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

import { fetchClient, h, iconCloudDownload, iconEye, RemoteData, sessionService } from '/js/src/index.js';
import { popover } from '../../../components/common/popover/popover.js';
import { PopoverAnchors } from '../../../components/common/popover/PopoverEngine.js';
import { PopoverTriggerPreConfiguration } from '../../../components/common/popover/popoverPreConfigurations.js';
import { StatefulComponent } from '../../../components/common/StatefulComponent.js';
import spinner from '../../../components/common/spinner.js';
import errorAlert from '../../../components/common/errorAlert.js';
import { buildUrl } from '../../../utilities/fetch/buildUrl.js';
import { filePreviewComponent, isPreviewForMimeType } from './filePreviewComponent.js';

/**
 * Return the URL of a give attachment
 *
 * @param {Attachment} attachment the attachment for which href should be returned
 * @param {string} [token] if it applies, the authentication token
 * @return {string} the attachment URL
 */
const getAttachmentUrl = (attachment, token) => buildUrl(`/api/attachments/${attachment.id}`, { token });

/**
 * Component to display an attachment preview
 */
class AttachmentPreviewComponent extends StatefulComponent {
    /**
     * Constructor
     * @param {{attrs: {attachment: Attachment}}} vnode the vnode configuration
     * @return {void}
     */
    oninit({ attrs: { attachment } }) {
        this._attachment = attachment;

        /**
         * @type {RemoteData<Blob, ApiError>}
         * @private
         */
        this._remoteFileBlob = RemoteData.notAsked();

        if (isPreviewForMimeType(attachment.mimeType)) {
            this._setRemoteFileBlob(RemoteData.loading());

            const defaultApiError = { title: 'No preview available' };
            fetchClient(getAttachmentUrl(attachment)).then(
                async (response) => {
                    if (response.ok) {
                        try {
                            this._setRemoteFileBlob(RemoteData.success(await response.blob()));
                        } catch (e) {
                            this._setRemoteFileBlob(RemoteData.failure(defaultApiError));
                        }
                    } else {
                        this._setRemoteFileBlob(RemoteData.failure(defaultApiError));
                    }
                },
                () => this._setRemoteFileBlob(RemoteData.failure(defaultApiError)),
            );
        }
    }

    /**
     * Render the component
     *
     * @return {Component} the component
     */
    view() {
        return h('', this._remoteFileBlob.match({
            NotAsked: () => h(
                'a',
                {
                    download: this._attachment.originalName,
                    href: getAttachmentUrl(this._attachment, sessionService.get().token),
                },
                [iconCloudDownload(), this._attachment.fileName],
            ),
            Loading: () => spinner(),
            Success: (file) => popover(
                filePreviewPopoverLink(this._attachment.originalName),
                h(
                    '.p2.flex-column.g2',
                    h('.flex-row.justify-between.g3', [
                        h('.f3', this._attachment.originalName),
                        h(
                            'a.btn.btn-primary',
                            { download: this._attachment.originalName, href: getAttachmentUrl(this._attachment, sessionService.get().token) },
                            [iconCloudDownload(), ' Download'],
                        ),
                    ]),
                    h(
                        '.flex-row.justify-center.scroll-auto',
                        filePreviewComponent(file, this._attachment.mimeType, this._attachment.originalName),
                    ),
                ),
                {
                    ...PopoverTriggerPreConfiguration.click,
                    anchor: PopoverAnchors.TOP_MIDDLE,
                    setChildrenSize: true,
                },
            ),
            Failure: (errors) => errorAlert(errors),
        }));
    }

    /**
     * Set the remote file
     *
     * @param {RemoteData<Blob, ApiError>} remoteFileBlob the remote attachment file
     * @return {void}
     */
    _setRemoteFileBlob(remoteFileBlob) {
        this._remoteFileBlob = remoteFileBlob;
        this.notify();
    }
}

/**
 * Display a file preview link with preview popover
 *
 * @param {string} label the name of the file
 * @return {Component} the file preview popover link
 */
export const filePreviewPopoverLink = (label) => h(
    'a',
    { href: '#', onclick: (e) => e.preventDefault() },
    [iconEye(), label],
);

/**
 * Display a preview of the given attachment
 *
 * @param {Attachment} attachment the attachment to display
 * @return {Component} the attachment preview
 */
export const attachmentPreviewComponent = (attachment) => h(AttachmentPreviewComponent, { attachment });
