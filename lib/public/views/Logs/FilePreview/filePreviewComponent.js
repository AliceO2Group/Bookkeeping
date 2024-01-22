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

import { h, iconCloudDownload, iconEye } from '/js/src/index.js';
import { popover } from '../../../components/common/popover/popover.js';
import { PopoverAnchors } from '../../../components/common/popover/PopoverEngine.js';
import { PopoverTriggerPreConfiguration } from '../../../components/common/popover/popoverPreConfigurations.js';

/**
 * Creates a preview of the file given by returning a popover. If creating a preview is not possible,
 * just a vnode for the file name is returned.
 * The following file extensions are tested and implemented, not tested and implemented, or not possible:
 *      Tested and implemented:
 *      - png
 *      - jpg
 *      - txt
 *      - log
 *      - sh
 *      - c
 *      - jpeg
 *      - json
 *      - csv
 *      - gif (image based)
 *
 *      Not tested or implemented as preview:
 *      - pages
 *      - zip
 *      - rtf
 *      - gz
 *      - view1
 *
 *      Not possible (since you need an external url or library):
 *      - docx
 *      - odt
 *      - pdf
 *      - xlsx
 *      - pptx
 *
 * @param {FilePreviewModel} filePreviewModel the model that holds the file previews
 * @param {Blob|string} attachment the file to create a preview of, if possible
 * @param {vnode} seperator the seperator to apply after the fileName
 * @param {string} url the url to create a blob, if any
 * @param {object} downloadAttributes attributes needed for downloading the file
 * @returns {vnode} the file name with or without a popover
 */
export const filePreviewComponent = (filePreviewModel, attachment, seperator, url = undefined, downloadAttributes = null) => {
    const nameWithSeperator = [attachment.name, seperator];
    const previewFileTypes = {
        image: false,
        json: false,
        csv: false,
        shellscript: false,
        text: false, // For all text file types left
    };

    for (const key in previewFileTypes) {
        if (attachment.type.match(key)) {
            previewFileTypes[key] = true;
        }
    }

    const previewButton = h('a.attachment', {
        key: attachment.name,
    }, [iconEye(), nameWithSeperator]);

    /**
     * Creates the window with the content for the previewPopover
     *
     * @param {string|vnode} content the preview to add to the popover
     * @returns {vnode} the window with the preview of the file
     */
    const createCustomPopover = (content) => h('.preview-window', [
        h('.preview-header', [
            h('.f3', attachment.name),
            downloadAttributes && h('a.btn.btn-primary', { ...downloadAttributes, href: url }, [iconCloudDownload(), ' Download']),
        ]),
        h('.preview-content', content),
    ]);

    /**
     * Creates a vnode with a clickable file name to open the popover with the preview
     *
     * @param {string|vnode} content the preview to add to the popover
     * @returns {vnode} the preview popover
     */
    const previewPopover = (content) => popover(
        previewButton,
        createCustomPopover(content),
        {
            ...PopoverTriggerPreConfiguration.click,
            anchor: PopoverAnchors.LEFT_MIDDLE,
        },
    );

    if (previewFileTypes.image) {
        filePreviewModel.handleFileType.image(attachment, url);

        const fileContent = h('img.preview-file-content', {
            alt: attachment.name,
            src: filePreviewModel.getAttachmentPreview(attachment.name),
        });

        return previewPopover(fileContent);
    } else if (previewFileTypes.csv) {
        filePreviewModel.handleFileType.csv(attachment, url)

        const fileContent = h(
            'table.table.table-hover.preview-file-content',
            filePreviewModel.getAttachmentPreview(attachment.name),
        );

        return previewPopover(fileContent);
    } else if (previewFileTypes.json || previewFileTypes.text || previewFileTypes.shellscript) {
        if (previewFileTypes.json) {
            filePreviewModel.handleFileType.json(attachment, url);
        } else if (previewFileTypes.text || previewFileTypes.shellscript) {
            filePreviewModel.handleFileType.text(attachment, url);
        }

        const fileContent = h(
            'pre.preview-file-content',
            filePreviewModel.getAttachmentPreview(attachment.name),
        );

        return previewPopover(fileContent);
    } else {
        if (downloadAttributes) {
            return h('a', { ...downloadAttributes, href: url }, [iconCloudDownload(), nameWithSeperator]);
        } else {
            return h('span.attachment', {
                key: attachment.name,
            }, nameWithSeperator);
        }
    }
};
