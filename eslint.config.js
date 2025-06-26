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
const stylisticJs = require('@stylistic/eslint-plugin-js');

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
            jsdoc,
            '@stylistic/js': stylisticJs,
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
            '@stylistic/js/array-bracket-newline': [
                'error',
                {
                    multiline: true,
                },
            ],
            '@stylistic/js/array-bracket-spacing': [
                'error',
                'never',
                {
                    singleValue: false,
                },
            ],
            '@stylistic/js/array-element-newline': [
                'error',
                'consistent',
            ],
            '@stylistic/js/arrow-parens': [
                'error',
                'always',
            ],
            '@stylistic/js/brace-style': [
                'error',
                '1tbs',
                {
                    allowSingleLine: false,
                },
            ],
            '@stylistic/js/comma-dangle': [
                'error',
                'always-multiline',
            ],
            '@stylistic/js/comma-spacing': [
                'error',
                {
                    before: false,
                    after: true,
                },
            ],
            '@stylistic/js/comma-style': [
                'error',
                'last',
            ],
            '@stylistic/js/computed-property-spacing': 'error',
            '@stylistic/js/dot-location': [
                'error',
                'property',
            ],
            '@stylistic/js/eol-last': [
                'error',
                'always',
            ],
            '@stylistic/js/function-call-argument-newline': [
                'error',
                'consistent',
            ],
            '@stylistic/js/function-paren-newline': [
                'error',
                'multiline',
            ],
            '@stylistic/js/indent': [
                'error',
                4,
                {
                    SwitchCase: 1,
                },
            ],
            '@stylistic/js/key-spacing': 'error',
            '@stylistic/js/keyword-spacing': 'error',
            '@stylistic/js/linebreak-style': 'off',
            '@stylistic/js/lines-around-comment': [
                'error',
                {
                    allowBlockStart: true,
                    allowClassStart: true,
                    beforeBlockComment: true,
                },
            ],
            '@stylistic/js/lines-between-class-members': [
                'error',
                'always',
            ],
            '@stylistic/js/max-len': [
                'error',
                {
                    code: 145,
                },
            ],
            '@stylistic/js/multiline-comment-style': [
                'error',
                'starred-block',
            ],
            '@stylistic/js/no-extra-parens': [
                'error',
                'all',
                {
                    conditionalAssign: false,
                    ternaryOperandBinaryExpressions: false,
                },
            ],
            '@stylistic/js/no-multi-spaces': 'error',
            '@stylistic/js/no-multiple-empty-lines': [
                'error',
                {
                    max: 1,
                    maxBOF: 0,
                    maxEOF: 0,
                },
            ],
            '@stylistic/js/no-trailing-spaces': 'error',
            '@stylistic/js/object-curly-spacing': [
                'error',
                'always',
            ],
            '@stylistic/js/object-property-newline': [
                'error',
                {
                    allowAllPropertiesOnSameLine: true,
                },
            ],
            '@stylistic/js/padded-blocks': [
                'error',
                'never',
            ],
            '@stylistic/js/padding-line-between-statements': [
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
            '@stylistic/js/quote-props': [
                'error',
                'as-needed',
            ],
            '@stylistic/js/quotes': [
                'error',
                'single',
                {
                    avoidEscape: true,
                },
            ],
            '@stylistic/js/semi': 'error',
            '@stylistic/js/semi-style': [
                'error',
                'last',
            ],
            '@stylistic/js/space-before-blocks': [
                'error',
                {
                    functions: 'always',
                    keywords: 'always',
                    classes: 'always',
                },
            ],
            '@stylistic/js/space-before-function-paren': [
                'error',
                {
                    anonymous: 'always',
                    named: 'never',
                    asyncArrow: 'always',
                },
            ],
            '@stylistic/js/space-infix-ops': 'error',
            '@stylistic/js/space-in-parens': [
                'error',
                'never',
            ],
            '@stylistic/js/template-curly-spacing': [
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
