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

const DEFAULT_MAX_LENGTH = 120;

const CODE_PLACEHOLDER = '\u0000';
const CODE_PLACEHOLDER_REGEX = new RegExp(`${CODE_PLACEHOLDER}(\\d+)${CODE_PLACEHOLDER}`, 'g');

/**
 * Strip the markdown syntax of a single line, keeping only its readable text
 *
 * The content of inline code spans and any punctuation that is not markdown formatting (for example the underscores of LHC22b_apass1) is kept
 *
 * @param {string} line the markdown line
 * @return {string} the plain text line
 */
const stripMarkdownLine = (line) => {
    // Code spans are protected first, their content is literal
    const codeSpans = [];
    const text = line
        .replaceAll(CODE_PLACEHOLDER, '')
        .replace(/`([^`]+)`/g, (_, code) => `${CODE_PLACEHOLDER}${codeSpans.push(code) - 1}${CODE_PLACEHOLDER}`)
        .replace(/!\[([^\]]*)]\([^)]*\)/g, '$1') // Images
        .replace(/\[([^\]]*)]\([^)]*\)/g, '$1') // Links
        .replace(/^\s*(#{1,6}|>|[-*+]|\d+\.)\s+/, '') // Headings, quotes and list markers
        .replace(/\*\*([^*\s](?:[^*]*?[^*\s])?)\*\*/g, '$1') // Strong with asterisks
        .replace(/(^|\W)__([^_\s](?:.*?[^_\s])?)__(?!\w)/g, '$1$2') // Strong with underscores, never inside a word
        .replace(/~~([^~\s](?:[^~]*?[^~\s])?)~~/g, '$1') // Strike-through
        .replace(/\*([^*\s](?:[^*]*?[^*\s])?)\*/g, '$1') // Emphasis with asterisks
        .replace(/(^|\W)_([^_\s](?:[^_]*?[^_\s])?)_(?!\w)/g, '$1$2'); // Emphasis with underscores, never inside a word

    return text
        .replace(CODE_PLACEHOLDER_REGEX, (_, index) => codeSpans[Number(index)])
        .replace(/\s+/g, ' ')
        .trim();
};

/**
 * Build a one-line plain text preview of a log's content
 *
 * The markdown syntax is removed, a first line identical to the log's title is skipped, and the result is truncated on a word boundary
 *
 * @param {string|null} [text] the markdown content of the log
 * @param {string} [title] the title of the log, a leading line equal to it is not part of the snippet
 * @param {number} [maxLength=120] the maximum length of the snippet, ellipsis included
 * @return {string} the snippet, or an empty string if the log has no meaningful content
 */
export const formatLogSnippet = (text, title = '', maxLength = DEFAULT_MAX_LENGTH) => {
    if (!text) {
        return '';
    }

    let inCodeFence = false;
    const lines = [];
    for (const rawLine of String(text).split(/\r?\n|\\n/)) {
        if (rawLine.trim().startsWith('```')) {
            inCodeFence = !inCodeFence;
            continue;
        }
        const line = inCodeFence ? rawLine.replace(/\s+/g, ' ').trim() : stripMarkdownLine(rawLine);
        if (line) {
            lines.push(line);
        }
    }

    if (lines.length > 0 && lines[0].toLowerCase() === String(title).replace(/\s+/g, ' ').trim().toLowerCase()) {
        lines.shift();
    }

    const snippet = lines.join(' ');
    if (snippet.length <= maxLength) {
        return snippet;
    }

    const truncated = snippet.slice(0, maxLength - 1);
    const lastSpace = truncated.lastIndexOf(' ');
    return `${(lastSpace > maxLength / 2 ? truncated.slice(0, lastSpace) : truncated).trimEnd()}…`;
};
