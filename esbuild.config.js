#!/usr/bin/env node

import esbuild from 'esbuild'

console.time('build')

try {
	const result = await esbuild.build({
		entryPoints: ['src/plugin.js'],
		bundle: true,
		sourcemap: true,
		minify: true,
		splitting: false,
		platform: 'node',
		format: 'cjs',
		// outdir: 'dist',
		outfile: 'dist/plugin.cjs',
		target: ['es2021'],
		// external: ['node:path', 'node:fs', 'got', 'is-svg', 'file-type', 'debug'],
		external: ['node:path', 'node:fs', 'debug'],
	})
	console.log(result)
} catch (error) {
	console.error(error)
	process.exit(1)
} finally {
	console.timeEnd('build')
}
