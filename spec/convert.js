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

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const merge = require('deepmerge');

const swaggerDocumentPath = path.resolve(__dirname, 'openapi-source.yaml');
const swaggerGeneratedDocumentPath = path.resolve(__dirname, 'openapi.yaml');

const swaggerDocument = yaml.load(fs.readFileSync(swaggerDocumentPath));

// eslint-disable-next-line require-jsdoc
const arraysEqual = (a, b) => {
    // Are the lengths the same?
    let i = a.length;
    if (i !== b.length) {
        return false;
    }

    // Are all the values the same?
    while (i --) {
        if (a[i] !== b[i]) {
            return false;
        }
    }

    return true;
};

// eslint-disable-next-line require-jsdoc
const convert = (obj) => {
    const spec = merge({}, obj);
    let changed = false;

    // eslint-disable-next-line require-jsdoc
    const traverse = (obj, parent = []) => {
        if (typeof obj === 'object' && obj !== null) {
            Object.keys(obj).forEach((item) => traverse(obj[item], [item, ...parent]));
        }

        if (parent[0] === 'allOf') {
            let merged = {};

            for (const iterator of obj) {
                let item = {};
                if (iterator['$ref']) {
                    const path = obj[0]['$ref'].split('/');
                    item = spec[parent[3]][parent[2]][path[path.length - 1]];
                } else {
                    item = iterator;
                }

                merged = merge(merged, item);
            }

            spec[parent[3]][parent[2]][parent[1]] = merged;
            changed = true;
        }

        if (parent[0] === 'responses' && parent[3] === 'paths') {
            if (!Object.keys(obj).includes('default')) {
                obj['default'] = { $ref: '#/components/responses/UnexpectedError' };
                changed = true;
            }

            spec[parent[3]][parent[2]][parent[1]][parent[0]] = obj;
        }

        if (parent[1] === 'responses' && parent[4] === 'paths') {
            switch (parent[0]) {
                case 'default':
                    if (Object.keys(obj).length !== 1 || obj['$ref'] !== '#/components/responses/UnexpectedError') {
                        obj = { $ref: '#/components/responses/UnexpectedError' };
                        changed = true;
                    }
                    break;
            }

            spec[parent[4]][parent[3]][parent[2]][parent[1]][parent[0]] = obj;
        }

        if (parent[0] === 'required' && parent[2] === 'schemas' && parent[3] === 'components') {
            const unsorted = spec[parent[3]][parent[2]][parent[1]][parent[0]];
            const sorted = spec[parent[3]][parent[2]][parent[1]][parent[0]].sort();
            if (!arraysEqual(unsorted, sorted)) {
                spec[parent[3]][parent[2]][parent[1]][parent[0]] = sorted;
                changed = true;
            }
        }

        if (parent[0] === 'properties' && parent[2] === 'schemas' && parent[3] === 'components') {
            const unsorted = Object.keys(spec[parent[3]][parent[2]][parent[1]][parent[0]]);
            const sorted = Object.keys(spec[parent[3]][parent[2]][parent[1]][parent[0]]).sort();

            if (!arraysEqual(unsorted, sorted)) {
                const obj = {};
                for (const key of sorted) {
                    obj[key] = spec[parent[3]][parent[2]][parent[1]][parent[0]][key];
                }

                spec[parent[3]][parent[2]][parent[1]][parent[0]] = obj;
                changed = true;
            }
        }
    };

    do {
        changed = false;
        traverse(spec);
    } while (changed);

    return spec;
};

// eslint-disable-next-line require-jsdoc
const dumpYaml = (loc, obj) => {
    fs.writeFileSync(loc, yaml.dump(obj, {
        indent: 2,
        lineWidth: 80,
        sortKeys: false,
    }));
};

// eslint-disable-next-line require-jsdoc
const addGeneratedHeader = (loc) => {
    const header = `# Generated on ${new Date().toUTCString()}`;
    const data = `${header}\n\n${fs.readFileSync(loc)}`;
    fs.writeFileSync(loc, data, () => {});
};

dumpYaml(swaggerDocumentPath, swaggerDocument);

const swaggerGeneratedDocument = convert(swaggerDocument);
const oldSwaggerGeneratedDocument = yaml.load(fs.readFileSync(swaggerGeneratedDocumentPath));
if (JSON.stringify(oldSwaggerGeneratedDocument) !== JSON.stringify(swaggerGeneratedDocument)) {
    dumpYaml(swaggerGeneratedDocumentPath, swaggerGeneratedDocument);
    addGeneratedHeader(swaggerGeneratedDocumentPath);
}
