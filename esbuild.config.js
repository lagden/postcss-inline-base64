#!/usr/bin/env node

import esbuild from 'esbuild'

const stripNodeColonPlugin = {
	name: 'strip-node-colon',
	setup({onResolve}) {
		onResolve(
			{filter: /^node:/},
			args => ({path: args.path.slice('node:'.length), external: true}),
		)
	},
}

console.time('build')

const commonOpions = {
	entryPoints: ['src/plugin.js'],
	bundle: true,
	sourcemap: true,
	minify: false,
	splitting: false,
	platform: 'node',
	target: ['node12'],
}

// const esm = esbuild.build({
// 	...commonOpions,
// 	format: 'esm',
// 	external: ['node:path', 'node:fs', 'got', 'is-svg', 'file-type', 'debug'],
// 	outfile: 'dist/esm/plugin.js',
// })

const cjs = esbuild.build({
	...commonOpions,
	format: 'cjs',
	external: ['node:path', 'node:fs'],
	outfile: 'dist/plugin.cjs',
	plugins: [stripNodeColonPlugin],
})

// const builds = [esm, cjs]
const builds = [cjs]

try {
	const results = await Promise.all(builds)
	console.log(results)
} catch (error) {
	console.error(error)
	process.exit(1)
} finally {
	console.timeEnd('build')
}
