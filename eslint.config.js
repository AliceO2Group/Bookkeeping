/**
 * @license
 * Copyright 2019-2020 CERN and copyright holders of ALICE O2.
 * See http://alice-o2.web.cern.ch/copyright for details of the copyright holders.
 * All rights not expressly granted are reserved.
 *
 * This software is distributed under the terms of the GNU General Public
 * License v3 (GPL Version 3), copied verbatim in the file "COPYING".
 *
 * In applying this license CERN does not waive the privileges and immunities
 * granted to it by virtue of its status as an Intergovernmental Organization
 * or submit itself to any jurisdiction.
 */

const globals = require('globals');
const pluginJs = require('@eslint/js');
const jsdoc = require('eslint-plugin-jsdoc');
const stylistic = require('@stylistic/eslint-plugin');

module.exports = [
    {
        ignores: [
            'test/',
            'node_modules/',
            'database/data/',
            'lib/public/assets/',
            'cpp-api-client/',
            'tmp/',
            '.nyc_output/',
        ],
    },
    jsdoc.configs['flat/recommended'],
    pluginJs.configs.recommended,
    {
        plugins: {
            '@stylistic': stylistic,
        },
        languageOptions: {
            parserOptions: {
                sourceType: 'module',
            },
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.mocha,
                process: 'readonly',
                Model: 'readonly',
                vnode: 'readonly',
                Express: 'readonly',
                setImmediate: 'readonly',
            },
        },
        settings: {
            jsdoc: {
                tagNamePreference: {
                    returns: 'return',
                },
            },
        },
        rules: {
            'arrow-body-style': ['error', 'as-needed'],
            curly: 'error',
            'init-declarations': 'off',
            'no-console': 'error',
            'no-implicit-coercion': 'error',
            'no-return-assign': 'error',
            'no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^(_|((request|response|next)$))',
                },
            ],
            'no-var': 'error',
            'one-var': [
                'error',
                'never',
            ],
            'prefer-arrow-callback': [
                'error',
                {
                    allowUnboundThis: true,
                },
            ],
            'prefer-const': 'error',
            'prefer-destructuring': 'error',
            'prefer-object-spread': 'error',
            'prefer-template': 'error',
            radix: 'error',
            'capitalized-comments': [
                'error',
                'always',
            ],
            'jsdoc/require-description': ['error'],
            'jsdoc/require-returns': [0], // TODO
            'jsdoc/require-jsdoc': [
                'error',
                {
                    require: {
                        FunctionDeclaration: true,
                        MethodDefinition: true,
                        ClassDeclaration: true,
                        ArrowFunctionExpression: false, // TODO
                        FunctionExpression: true,
                    },
                },
            ],
            'jsdoc/check-tag-names': ['off'], // TODO
            'jsdoc/check-values': ['off'],
            'jsdoc/check-types': ['off'], // TODO
            'jsdoc/require-property-description': ['off'], // TODO
            'jsdoc/no-multi-asterisks': ['off'],
            'jsdoc/no-undefined-types': ['off'],
            'jsdoc/no-defaults': ['off'],
            // 'jsdoc/tag-lines': ['error', 'any', { startLines: 1 }],
            'jsdoc/tag-lines': ['off'], // TODO with above 0 or 1
            'jsdoc/reject-any-type': ['off'], // TODO
            'jsdoc/reject-function-type': ['off'], // TODO
            '@stylistic/array-bracket-newline': [
                'error',
                {
                    multiline: true,
                },
            ],
            '@stylistic/array-bracket-spacing': [
                'error',
                'never',
                {
                    singleValue: false,
                },
            ],
            '@stylistic/array-element-newline': [
                'error',
                'consistent',
            ],
            '@stylistic/arrow-parens': [
                'error',
                'always',
            ],
            '@stylistic/brace-style': [
                'error',
                '1tbs',
                {
                    allowSingleLine: false,
                },
            ],
            '@stylistic/comma-dangle': [
                'error',
                'always-multiline',
            ],
            '@stylistic/comma-spacing': [
                'error',
                {
                    before: false,
                    after: true,
                },
            ],
            '@stylistic/comma-style': [
                'error',
                'last',
            ],
            '@stylistic/computed-property-spacing': 'error',
            '@stylistic/dot-location': [
                'error',
                'property',
            ],
            '@stylistic/eol-last': [
                'error',
                'always',
            ],
            '@stylistic/function-call-argument-newline': [
                'error',
                'consistent',
            ],
            '@stylistic/function-paren-newline': [
                'error',
                'multiline',
            ],
            '@stylistic/indent': [
                'error',
                4,
                {
                    SwitchCase: 1,
                },
            ],
            '@stylistic/key-spacing': 'error',
            '@stylistic/keyword-spacing': 'error',
            '@stylistic/linebreak-style': 'off',
            '@stylistic/lines-around-comment': [
                'error',
                {
                    allowBlockStart: true,
                    allowClassStart: true,
                    beforeBlockComment: true,
                },
            ],
            '@stylistic/lines-between-class-members': [
                'error',
                'always',
            ],
            '@stylistic/max-len': [
                'error',
                {
                    code: 145,
                },
            ],
            '@stylistic/multiline-comment-style': [
                'error',
                'starred-block',
            ],
            '@stylistic/no-extra-parens': [
                'error',
                'all',
                {
                    conditionalAssign: false,
                    ternaryOperandBinaryExpressions: false,
                },
            ],
            '@stylistic/no-multi-spaces': 'error',
            '@stylistic/no-multiple-empty-lines': [
                'error',
                {
                    max: 1,
                    maxBOF: 0,
                    maxEOF: 0,
                },
            ],
            '@stylistic/no-trailing-spaces': 'error',
            '@stylistic/object-curly-spacing': [
                'error',
                'always',
            ],
            '@stylistic/object-property-newline': [
                'error',
                {
                    allowAllPropertiesOnSameLine: true,
                },
            ],
            '@stylistic/padded-blocks': [
                'error',
                'never',
            ],
            '@stylistic/padding-line-between-statements': [
                'error',
                {
                    blankLine: 'always',
                    prev: 'cjs-import',
                    next: '*',
                },
                {
                    blankLine: 'any',
                    prev: 'cjs-import',
                    next: 'cjs-import',
                },
                {
                    blankLine: 'always',
                    prev: '*',
                    next: 'cjs-export',
                },
            ],
            '@stylistic/quote-props': [
                'error',
                'as-needed',
            ],
            '@stylistic/quotes': [
                'error',
                'single',
                {
                    avoidEscape: true,
                },
            ],
            '@stylistic/semi': 'error',
            '@stylistic/semi-style': [
                'error',
                'last',
            ],
            '@stylistic/space-before-blocks': [
                'error',
                {
                    functions: 'always',
                    keywords: 'always',
                    classes: 'always',
                },
            ],
            '@stylistic/space-before-function-paren': [
                'error',
                {
                    anonymous: 'always',
                    named: 'never',
                    asyncArrow: 'always',
                },
            ],
            '@stylistic/space-infix-ops': 'error',
            '@stylistic/space-in-parens': [
                'error',
                'never',
            ],
            '@stylistic/template-curly-spacing': [
                'error',
                'never',
            ],
            'no-magic-numbers': 'off', // TODO: enable
            'sort-keys': 'off',
            'sort-imports': 'off',
            'sort-vars': 'off',
        },
    },
];
