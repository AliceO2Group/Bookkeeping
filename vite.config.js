import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';
import commonjs from 'vite-plugin-commonjs';

export default defineConfig({
    root: 'lib/public',
    build: {
        rollupOptions: {
            external: [
                '/js/src/sessionService.js',
                '/js/src/index.js',
                '/js/src/icons.js',
                'api/configuration.js',
                '/assets/SmartEditor/HyperMD/index.js',
                '/assets/SmartEditor/HyperMD/powerpack/hover-with-marked.js',
                '/assets/SmartEditor/HyperMD/powerpack/paste-with-turndown.js',
                '/assets/SmartEditor/emojione/extras/js/complete-emoji.min.js',
                '/assets/SmartEditor/HyperMD/powerpack/fold-emoji-with-emojione.js',
                '/assets/SmartEditor/codemirror/addon/fold/foldcode.min.js',
                '/assets/SmartEditor/codemirror/addon/fold/foldgutter.min.js',
                '/assets/SmartEditor/codemirror/addon/fold/markdown-fold.min.js',
                '/assets/SmartEditor/codemirror/addon/mode/overlay.min.js',
                '/assets/SmartEditor/codemirror/mode/markdown/markdown.min.js',
                '/assets/SmartEditor/codemirror/mode/xml/xml.min.js',
                '/assets/SmartEditor/codemirror/mode/meta.min.js',
                '/assets/SmartEditor/codemirror/mode/yaml/yaml.min.js',
                '/assets/SmartEditor/codemirror/mode/javascript/javascript.min.js',
                '/assets/SmartEditor/codemirror/mode/stex/stex.min.js',
                '/assets/SmartEditor/show-hint/show-hint.min.js',
                '/assets/SmartEditor/HyperMD/powerpack/insert-file-with-smms.js',
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
