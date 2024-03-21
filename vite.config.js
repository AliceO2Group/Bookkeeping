/* eslint-disable max-len */
/* eslint-disable no-unused-vars */
/* eslint-disable capitalized-comments */
/* eslint-disable multiline-comment-style */
import path from 'path';
import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';
import commonjs from '@rollup/plugin-commonjs';


export default defineConfig({
    root: 'lib/public',
    resolve: {
        alias: {
            '@mithril': path.join(require.resolve('mithril'), '..'),
            '@web-ui/css/src/index.js': path.join(require.resolve('@aliceo2/web-ui'), '../../', 'Frontend', 'css', 'src', 'bootstrap.css'),
            // '/mithril/mithril.min.js': path.join(require.resolve('mithril'), 'index.js'),
        },
    },
    optimizeDeps: {
        // include: ['@aliceo2/*', '@aliceo2/web-ui'],
    },
    build: {
        // minify: true,
        // commonjsOptions: {
        //     // include: [/@aliceo2\/webui/, /node_modules/],
        // },
        // commonjsOptions: { include: ['@aliceo2/web-ui'] },
        rollupOptions: {
            // preserveEntrySignatures: 'allow-extension',
            // include: ['mithril/mithril.min/js'],
            external: [
                // '/mithril/mithril.min',
                // '/js/src/sessionService.js',
                // '/js/src/index.js',
                // '/js/src/icons.js',
                '/api/configuration.js',
            ],
        },
    },
    plugins: [
        // commonjs(),
        // VitePluginNode({
        //     adapter: 'express',
        //     appPath: './lib/ser.mjs.js',
        //     exportName: 'viteNodeApp',
        //     tsCompiler: 'swc',
        //     initAppOnBoot: true,
        // }),
    ],
});
