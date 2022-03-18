import process from 'node:process'
import path from 'node:path'
import parse from './lib/parse.js'
import * as debug from './lib/debug.js'

const b64Regx = /(?<match>b64-{3}["']?(?<file>[\w-./:]+)["']?-{3})/g

/**
 * @param {Object<Options>} options
 * @returns {Promise}
 */
function plugin(options = {}) {
	return {
		postcssPlugin: 'postcss-inline-base64',
		prepare(result) {
			const {to = process.cwd()} = result.opts
			options = {baseDir: path.dirname(to), ...options}

			debug.log('src/lib/plugin.js | plugin | options', options)

			const inlines = new Set([])
			return {
				Declaration(node) {
					let matches
					while ((matches = b64Regx.exec(node.value)) !== null) {
						const {file, match} = matches.groups
						inlines.add(parse(file, match, node, options, result))
					}
				},
				RootExit() {
					return Promise.allSettled(inlines)
				},
			}
		},
	}
}

/**
 *
 * @type {Plugin}
 */
export default plugin

/**
 * @typedef Options                              - postcss-inline-base64 options
 * @property {String} [baseDir=process.cwd()]    - path to load files
 */
