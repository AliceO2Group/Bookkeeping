/**
 *  @license
 *  Copyright CERN and copyright holders of ALICE O2. This software is
 *  distributed under the terms of the GNU General Public License v3 (GPL
 *  Version 3), copied verbatim in the file "COPYING".
 *
 *  See http://alice-o2.web.cern.ch/license for full licensing information.
 *
 *  In applying this license CERN does not waive the privileges and immunities
 *  granted to it by virtue of its status as an Intergovernmental Organization
 *  or submit itself to any jurisdiction.
 */

/**
 * Generates the HTTP API reference (lib/server/api-docs/API.md and index.html) from the OpenAPI spec
 * (lib/server/api-docs/openapi.yaml), including ready to use curl examples.
 *
 * Usage: node scripts/build-api-docs.js
 */

const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');
const { marked } = require('marked');

const API_DOCS_DIR = path.resolve(__dirname, '..', 'lib', 'server', 'api-docs');
const SPEC_PATH = path.join(API_DOCS_DIR, 'openapi.yaml');
const OUTPUT_PATH = path.join(API_DOCS_DIR, 'API.md');
const CSS_PATH = path.join(__dirname, 'api-docs.css');
const HTML_OUTPUT_PATH = path.join(API_DOCS_DIR, 'index.html');
const NO_LLM_MARKER = '(not for LLM use)';
const HTTP_METHODS = ['get', 'post', 'put', 'patch', 'delete'];

// JSON_SCHEMA: plain YAML types only (no timestamps, binary or merge keys)
const spec = yaml.load(fs.readFileSync(SPEC_PATH, 'utf8'), { schema: yaml.JSON_SCHEMA });

// Every operation that is not a GET must say explicitly whether it is excluded from LLM / MCP use
const undeclaredOperations = Object.entries(spec.paths).flatMap(([route, pathItem]) => HTTP_METHODS
    .filter((method) => method !== 'get' && pathItem[method] && typeof pathItem[method]['x-llm-exclude'] !== 'boolean')
    .map((method) => `${method.toUpperCase()} ${route}`));
if (undeclaredOperations.length > 0) {
    throw new Error(`Add "x-llm-exclude: true|false" to these non-GET operations: ${undeclaredOperations.join(', ')}`);
}

/**
 * Escapes the characters that are significant in HTML
 *
 * @param {string} text the text to escape
 * @return {string} the escaped text
 */
const escapeHtml = (text) => String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll('\'', '&#39;');

/**
 * Quotes a value for a POSIX shell in single quotes, so that it is never interpreted
 *
 * @param {string} value the value to quote
 * @return {string} the quoted value
 */
const shellSingleQuote = (value) => `'${String(value).replaceAll('\'', '\'\\\'\'')}'`;

/**
 * Escapes a value to be put in a POSIX shell double-quoted string without any expansion
 *
 * @param {string} value the value to escape
 * @return {string} the escaped value
 */
const shellDoubleQuoteEscape = (value) => String(value).replace(/[\\"$`!]/g, '\\$&');

/**
 * Resolves a local $ref (e.g. #/components/schemas/Tag), returns the given object if it is not a reference
 *
 * @param {object} node the object to resolve
 * @return {object} the resolved object
 */
const resolve = (node) => {
    if (node?.$ref) {
        if (!node.$ref.startsWith('#/')) {
            throw new Error(`Only local $ref are supported, got "${node.$ref}"`);
        }
        return node.$ref.replace('#/', '').split('/').reduce((current, key) => current[key], spec);
    }
    return node;
};

/**
 * Returns a short human readable type for the given schema
 *
 * @param {object} schema the (possibly referenced) schema
 * @return {string} the type
 */
const typeOf = (schema) => {
    const { type = 'object', format } = resolve(schema);
    const types = Array.isArray(type) ? type : [type];
    return `${types.join(' \\| ')}${format ? ` (${format})` : ''}`;
};

/**
 * Escapes the pipes of the given text, so that they are not interpreted as column separators in a markdown table cell.
 * Backslashes right before a pipe are doubled, otherwise they would escape the backslash added in front of the pipe
 *
 * @param {string} text the text to escape
 * @return {string} the escaped text
 */
const escapeCell = (text) => text.replace(/(\\*)\|/g, '$1$1\\|');

/**
 * Returns the markdown table of the properties of the given object schema
 *
 * @param {object} schema the (possibly referenced) object schema
 * @return {string} the table
 */
const propertiesTable = (schema) => {
    const { properties = {}, required = [] } = resolve(schema);
    const rows = Object.entries(properties).map(([name, property]) => {
        const { description = '', minLength, maxLength, pattern } = resolve(property);
        const constraints = [
            minLength !== undefined && `min length ${minLength}`,
            maxLength !== undefined && `max length ${maxLength}`,
            pattern && `pattern \`${pattern}\``,
        ].filter(Boolean).join(', ');
        const notes = escapeCell([description, constraints].filter(Boolean).join(' ').replace(/\n/g, ' '));
        return `| \`${name}\` | ${typeOf(property)} | ${required.includes(name) ? 'yes' : 'no'} | ${notes} |`;
    });
    return ['| Field | Type | Required | Notes |', '| --- | --- | --- | --- |', ...rows].join('\n');
};

/**
 * Returns a sample value for the given query/path parameter
 *
 * @param {object} parameter the parameter
 * @return {string} the sample value
 */
const sampleValue = (parameter) => {
    const { schema = {} } = parameter;
    const [example] = schema.examples ?? [];
    return String(example ?? schema.default ?? (parameter.in === 'path' ? 1 : 'VALUE'));
};

/**
 * Builds the curl example of an operation
 *
 * @param {string} method the HTTP method
 * @param {string} route the route as in the spec
 * @param {object} operation the operation
 * @param {object[]} parameters the parameters of the operation
 * @return {string} the markdown
 */
const examplesOf = (method, route, operation, parameters) => {
    const url = route.replace(/{(\w+)}/g, (_, name) => sampleValue(parameters.find((parameter) => parameter.name === name)));
    const queryParameters = parameters
        .filter(({ in: location, name, required }) => location === 'query' && (required || name === 'page[limit]'));
    const query = queryParameters.map((parameter) => `${parameter.name}=${encodeURIComponent(sampleValue(parameter))}`);
    // $BOOKKEEPING_URL and $TOKEN are meant to be expanded by the shell, anything coming from the spec is not
    const address = `${shellDoubleQuoteEscape(`/api${url}?${[...query, 'token='].join('&')}`)}$TOKEN`;
    const body = operation.requestBody?.content?.['application/json']?.example;

    const curlLines = [
        `curl -g${method === 'get' ? '' : ` -X ${method.toUpperCase()}`} "$BOOKKEEPING_URL${address}"`,
        ...body === undefined ? [] : ['  -H \'content-type: application/json\'', `  -d ${shellSingleQuote(JSON.stringify(body))}`],
    ];

    return [
        '```bash',
        curlLines.join(' \\\n'),
        '```',
    ].join('\n');
};

/**
 * Renders one operation
 *
 * @param {string} method the HTTP method
 * @param {string} route the route as in the spec
 * @param {object} operation the operation
 * @param {object[]} sharedParameters the parameters declared at path level
 * @return {string} the markdown
 */
const renderOperation = (method, route, operation, sharedParameters) => {
    const parameters = [...sharedParameters, ...operation.parameters ?? []].map(resolve);
    const marker = operation['x-llm-exclude'] ? ` ${NO_LLM_MARKER}` : '';
    const out = [
        `### \`${method.toUpperCase()} ${route}\` - ${operation.summary}${marker}`,
        '',
        `Operation id: \`${operation.operationId}\``,
        '',
    ];

    if (operation.description) {
        out.push(operation.description.trim(), '');
    }
    if (operation['x-llm-exclude']) {
        out.push('**Not meant for LLM or MCP tool use** (`x-llm-exclude`).', '');
    }
    if (operation['x-required-roles']) {
        out.push(`**Required role:** ${operation['x-required-roles'].map((role) => `\`${role}\``).join(', ')}`, '');
    }

    if (parameters.length) {
        out.push(
            '| Parameter | In | Type | Required | Notes |',
            '| --- | --- | --- | --- | --- |',
            ...parameters.map((parameter) =>
                `| \`${parameter.name}\` | ${parameter.in} | ${typeOf(parameter.schema)} | ${parameter.required ? 'yes' : 'no'} | ${
                    escapeCell((parameter.description ?? '').replace(/\n/g, ' '))} |`),
            '',
        );
    }

    const requestSchema = operation.requestBody?.content?.['application/json']?.schema;
    if (requestSchema) {
        out.push('Request body (JSON):', '', propertiesTable(requestSchema), '');
    }

    out.push(
        'Responses:',
        '',
        ...Object.entries(operation.responses).map(([status, response]) =>
            `- \`${status}\`: ${(resolve(response).description ?? '').trim().replace(/\n/g, ' ')}`),
        '',
        examplesOf(method, route, operation, parameters),
        '',
    );

    return out.join('\n');
};

/**
 * Renders the whole document
 *
 * @return {string} the markdown
 */
const render = () => {
    const out = [
        '<!-- GENERATED by scripts/build-api-docs.js from openapi.yaml, do not edit. Run `npm run docs:api` -->',
        `# ${spec.info.title}`,
        '',
        spec.info.description.trim(),
        '',
        '## Quick start',
        '',
        'The examples below read the server address and the JWT from the environment:',
        '',
        '```bash',
        'export BOOKKEEPING_URL=http://localhost:4000',
        'export TOKEN=<your jwt>',
        '```',
        '',
        '`curl -g` is needed because of the `[` `]` in filter names. Note that a token in the URL ends up in shell history and server logs.',
        '',
    ];

    const groups = new Map();
    Object.entries(spec.paths).forEach(([route, pathItem]) => {
        HTTP_METHODS.filter((method) => pathItem[method]).forEach((method) => {
            const [group = 'Other'] = pathItem[method].tags ?? [];
            groups.set(group, [...groups.get(group) ?? [], renderOperation(method, route, pathItem[method], pathItem.parameters ?? [])]);
        });
    });

    groups.forEach((operations, group) => {
        const description = spec.tags?.find(({ name }) => name === group)?.description;
        out.push(`## ${group}`, '', ...description ? [description, ''] : [], ...operations);
    });

    return `${out.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd()}\n`;
};

/**
 * Wraps the markdown into a standalone HTML page (no script, the server CSP only allows scripts from itself)
 *
 * @param {string} markdown the markdown to convert
 * @return {string} the page
 */
const renderHtml = (markdown) => {
    const body = marked.parse(markdown.replace(/^<!--.*-->\n/, ''))
        // Turn the leading HTTP method of operation headings into a coloured badge
        .replace(
            /<h3>\s*<code>(GET|POST|PUT|PATCH|DELETE) ([^<]*)<\/code>/g,
            (_, method, route) => `<h3><span class="method ${method.toLowerCase()}">${method}</span> <code>${route}</code>`,
        )
        // Turn the "not for LLM use" marker of operation headings into a badge
        .replaceAll(
            NO_LLM_MARKER,
            '<span class="no-llm" title="Changes data: not meant for LLM or MCP tool use (x-llm-exclude)">not for LLM use</span>',
        )
        // Make each operation (an h3 and everything up to the next heading) a collapsed block
        .split(/(?=<h[23]>)/)
        .map((section) => {
            const [, heading, content] = section.match(/^(<h3>.*?<\/h3>)([\s\S]*)$/) ?? [];
            return heading ? `<details>\n<summary>${heading}</summary>\n${content}</details>\n` : section;
        })
        .join('');

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(spec.info.title)}</title>
<link rel="shortcut icon" href="/favicon.ico">
<style>
${fs.readFileSync(CSS_PATH, 'utf8')}</style>
</head>
<body>
<header><div>
<img src="/assets/alice.png" alt="ALICE">
<strong>Bookkeeping<span>HTTP API</span></strong>
<nav><a href="/api-docs/openapi.yaml">OpenAPI spec</a><a href="/api-docs/API.md">Markdown (for LLMs)</a></nav>
</div></header>
<main>
${body}
</main>
<footer>Generated from openapi.yaml by <code>npm run docs:api</code> · ALICE Bookkeeping · internal use only</footer>
</body>
</html>
`;
};

// The spec is trusted but the page is served without authentication: never let raw HTML or unsafe links through
marked.use({
    renderer: {
        html: ({ text }) => escapeHtml(text),

        /**
         * Renders a link only when it points to a safe location (http, https, mailto, or relative)
         *
         * @param {{href: string, title: string, tokens: object[]}} link the link token
         * @return {string} the html
         */
        link({ href, title, tokens }) {
            const label = this.parser.parseInline(tokens);
            return /^(https?:|mailto:|\/|#|\.)/i.test(href) ?
                `<a href="${escapeHtml(href)}"${title ? ` title="${escapeHtml(title)}"` : ''}>${label}</a>` :
                label;
        },
    },
});

const markdown = render();
fs.writeFileSync(OUTPUT_PATH, markdown);
fs.writeFileSync(HTML_OUTPUT_PATH, renderHtml(markdown));
// eslint-disable-next-line no-console
console.log(`Written ${path.relative(process.cwd(), OUTPUT_PATH)} and ${path.relative(process.cwd(), HTML_OUTPUT_PATH)}`);
