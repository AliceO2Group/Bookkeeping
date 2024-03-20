/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable capitalized-comments */
/* eslint-disable multiline-comment-style */
import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';
import commonjs from 'vite-plugin-commonjs';

export default defineConfig({
    root: 'lib',
    minify: true,
    build: {
        rollupOptions: {
            external: [
                '/js/src/sessionService.js',
                '/js/src/index.js',
                '/js/src/icons.js',
                '/api/configuration.js',
            ],
        },
    },
    plugins: [
        commonjs(),
        // VitePluginNode({
        //     adapter: 'express',
        //     appPath: './lib/ser.mjs.js',
        //     exportName: 'viteNodeApp',
        //     tsCompiler: 'swc',
        //     initAppOnBoot: true,
        // }),
    ],
});
