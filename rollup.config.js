const config = {
	input: 'src/index.js',
	output: {
		exports: 'default',
		file: 'dist/plugin.js',
		format: 'cjs',
		sourcemap: true,
		strict: true,
	},
	external: ['node:path', 'node:fs', 'got', 'is-svg', 'file-type', 'debug'],
}

export default config
