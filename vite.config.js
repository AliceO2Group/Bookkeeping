import path from 'path';
import { defineConfig } from 'vite';
import filterReplace from 'vite-plugin-filter-replace';
import { VitePluginNode } from 'vite-plugin-node';

export default defineConfig({
    root: 'lib/public',
    resolve: {
        alias: [
            {
                find: '@mithril/mithril.min.js',
                replacement: path.join(require.resolve('mithril'), '..'),
            },
            {
                find: '@web-ui/css/src/index.js',
                replacement: path.join(require.resolve('@aliceo2/web-ui'), '../../', 'Frontend', 'css', 'src', 'bootstrap.css'),
            },
        ],
    },
    build: {
        rollupOptions: {
            external: ['/api/configuration.js'],
        },
    },
    // server: {
        // proxy: {
            // '/api': {
            //     target: 'http://localhost:4000',
            //     changeOrigin: true,
            //     // rewrite: (path) => path.replace(/^\/api/, ''),
            // },
            // '/': {
                // target: 'http://localhost:4000',
                // changeOrigin: true,
                // rewrite: (path) => path.replace(/^\/api/, ''),
            // },
        // },
    // },
    plugins: [
        // VitePluginNode({
        //     adapter: 'express',
        //     exportName: 'viteApp',
        //     appPath: './vite.express.js',
        //     initAppOnBoot: true,
        // }),
        filterReplace([
            {
                filter: /.*\.js$/,
                replace: {
                    from: /\/mithril\/mithril.min.js/g,
                    to: '@mithril/mithril.min.js',
                },
            },
        ], {
            enforce: 'pre',
        }),
    ],
});
