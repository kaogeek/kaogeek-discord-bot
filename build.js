import { build } from 'esbuild'
import externalPackage from 'esbuild-plugin-external-package'

build({
  entryPoints: ['./src/client.js'],
  outdir: './dist',
  bundle: true,
  sourcemap: 'linked',
  platform: 'node',
  format: 'esm',
  minifySyntax: true,
  plugins: [externalPackage],
})
