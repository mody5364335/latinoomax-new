import {defineConfig} from 'vite';
import {viteSingleFile} from 'vite-plugin-singlefile';
export default defineConfig({base:'./',plugins:[viteSingleFile()],build:{rollupOptions:{input:'app.html'},minify:'esbuild'}});
