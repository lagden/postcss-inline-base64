import {_find, _mime} from './file.js'
import * as debug from './debug.js'

/**
 * @param {String} dir  - file path
 * @param {String} file - file name
 * @return {String} File converted to base64 string
 */
async function _inline(dir, file) {
	const buf = await _find(dir, file)
	const mime = await _mime(buf)
	return `data:${mime};charset=utf-8;base64,${buf.toString('base64')}`
}

/**
 * @param {Array<ParseArgs>} args
 * @return {undefined}
 */
async function _parse(...args) {
	const [file, match, decl, options, result] = args
	const node = decl.parent
	let data = file

	try {
		data = await _inline(options.baseDir, file)
	} catch (error) {
		node.warn(result, error.message)
		debug.error('_parse | error ---> ', error.message)
	} finally {
		decl.value = decl.value.replace(match, data)
	}
}

export default _parse

/**
 * @typedef ParseArgs                  - arguments to process
 * @property {String} file             - file to convert
 * @property {String} match            - syntax matching
 * @property {Object<Decl>} decl
 * @property {Object<Result>} result
 * @property {Object<Options>} options
 */

/**
 * @typedef Options                              - postcss-inline-base64 options
 * @property {String} [baseDir=process.cwd()]    - path to load files
 */

/**
 * @typedef Decl - postcss decl
 * @see http://api.postcss.org/Declaration.html
 */

/**
 * @typedef Result - postcss result
 * @see http://api.postcss.org/Result.html
 */
