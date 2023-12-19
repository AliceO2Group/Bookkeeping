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
 * @param {boolean} isLastItem boolean for defining if the current file is the last item
 * @param {string} url the url to create a blob, if any
 * @param {object} downloadAttributes attributes needed for downloading the file
 * @returns {vnode} the file name with or without a popover
 */
export const showFilePreview = (filePreviewModel, attachment, seperator, isLastItem, url = undefined, downloadAttributes = null) => {
    const isBlob = !url;
    const nameWithSeperator = [attachment.name, !isLastItem && seperator];
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
    }, [iconEye(), nameWithSeperator])

    const popOverWindow = (content) => h('.preview-window', [
        h('.preview-header', [
            h('.f3', attachment.name),
            downloadAttributes && h('a.btn.btn-primary', { ...downloadAttributes, href: url }, [iconCloudDownload(), ' Download attachment'])
        ]),
        h('.preview-content', content),
    ])
    /**
     * Creates a vnode with a clickable file name to open the popover with the preview
     *
     * @param {string|vnode} content the preview to add to the popover
     * @returns {vnode} the preview popover
     */
    const previewPopover = (content) => popover(
        previewButton,
        popOverWindow(content),
        {
            ...PopoverTriggerPreConfiguration.click,
            anchor: PopoverAnchors.LEFT_MIDDLE,
        },
    );

    /**
     * Checks if the file is a blob or not, and prepares the file to show
     *
     * @param {Method} awaitMethod actions to take after onload, or fetching
     * @param {Method} readMethod reader method to execute (readAsText, readAsDataUrl, ...)
     * @returns {void}
     */
    const readFile = (awaitMethod, readMethod) => {
        if (isBlob) {
            const reader = new FileReader();
            reader.onload = () => awaitMethod(reader.result);
            readMethod(attachment, reader);
        } else {
            filePreviewModel.fetchAttachmentPreview(url)
                .then(blob => {
                    const reader = new FileReader();
                    reader.onload = () => awaitMethod(reader.result);
                    readMethod(blob, reader);
                })
        }
    }

    if (previewFileTypes.image) {
        readFile(
            (data) => filePreviewModel.setAttachmentPreview(data, attachment.name),
            (data, reader) => reader.readAsDataURL(data)
        );
        
        const fileContent = h('img.preview-file-content', {
            alt: attachment.name,
            src: filePreviewModel.getAttachmentPreview(attachment.name),
        });

        return previewPopover(fileContent);
    } else if (previewFileTypes.csv) {
        readFile(
            (data) => {
                let content;
                const lines = data.split('\n');
                if (lines.length < 2) {
                    content = h('div', 'Invalid CSV format');
                } else {
                    const headers = lines[0].split(',');
                    const headerRow = h('tr', headers.map((header, index) => h('th', {
                        key: index,
                    }, header)));

                    const tableRows = lines.slice(1).map((line, rowIndex) => {
                        const columns = line.split(',');
                        return h('tr', { key: rowIndex }, columns.map((column, colIndex) => h('td', { key: colIndex }, column)));
                    });

                    content = [
                        h('thead', { key: 'thead' }, headerRow),
                        h('tbody', { key: 'tbody' }, tableRows),
                    ];
                }

                filePreviewModel.setAttachmentPreview(content, attachment.name)
            },
            (data, reader) => reader.readAsText(data)
        );

        const fileContent = h(
            'table.table.table-hover.preview-file-content',
            filePreviewModel.getAttachmentPreview(attachment.name)
        );

        return previewPopover(fileContent);
    } else if (previewFileTypes.json || previewFileTypes.text || previewFileTypes.shellscript) {
        readFile(
            (data) => {
                let content;

                if (previewFileTypes.json) {
                    const jsonContent = JSON.parse(data);
                    content = JSON.stringify(jsonContent, null, 2);
                } else if (previewFileTypes.text || previewFileTypes.shellscript) {
                    content = data;
                }

                filePreviewModel.setAttachmentPreview(content, attachment.name);
            },
            (data, reader) => reader.readAsText(data)
        );

        const fileContent = h(
            'pre.preview-file-content',
            filePreviewModel.getAttachmentPreview(attachment.name)
        );

        return previewPopover(fileContent);
    } else {
        if (downloadAttributes) return h('a', { ...downloadAttributes, href: url }, [iconCloudDownload(), nameWithSeperator]);
        else return h('span.attachment', {
            key: attachment.name,
        }, nameWithSeperator);
    }
};
