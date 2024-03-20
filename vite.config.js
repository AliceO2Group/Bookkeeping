/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable capitalized-comments */
/* eslint-disable multiline-comment-style */
import path from 'path';
import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';
// import commonjs from 'vite-plugin-commonjs';
import commonjs from '@rollup/plugin-commonjs';

import autoNamedExports from 'rollup-plugin-auto-named-exports';
import requireTransform from 'vite-plugin-require-transform';

export default defineConfig({
    root: 'lib/public',
    build: {
        // commonjsOptions: { include: ['@aliceo2/web-ui'] },
        rollupOptions: {
            external: [
                '/js/src/sessionService.js',
                '/js/src/index.js',
                '/js/src/icons.js',
                '/api/configuration.js',
                // Uncommenting causes Failed to load module script: Expected a JavaScript module script but the server responded with a MIME type of "text/css". Strict MIME type checking is enforced for module scripts per HTML spec.
                // see https://github.com/vitejs/vite/issues/8976
                // '/css/src/bootstrap.css',
            ],
        },
    },
    plugins: [
        commonjs(),
        // requireTransform({
        //     fileRegex: /.js$/,
        // }),
        // autoNamedExports(),
        // commonjs({
        //     include: /node_modules/,
        //     requireReturnsDefault: 'auto', // <---- this solves default issue
        // }),
        // VitePluginNode({
        //     adapter: 'express',
        //     appPath: './lib/ser.mjs.js',
        //     exportName: 'viteNodeApp',
        //     tsCompiler: 'swc',
        //     initAppOnBoot: true,
        // }),
    ],
});
