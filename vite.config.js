import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';

export default defineConfig({
    root: 'lib/public',
    build: {
        rollupOptions: {
            external: [
                '/js/src/sessionService.js',
                '/js/src/index.js',
                '/js/src/icons.js',
                'api/configuration.js',
            ],
        },
    },
    plugins: [
        VitePluginNode({
            adapter: 'express',
            appPath: './lib/ser.js',
            exportName: 'viteNodeApp',
            initAppOnBoot: true,
        }),
    ],
});
