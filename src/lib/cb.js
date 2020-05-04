'use strict'

const {dirname} = require('path')
const _parse = require('./parse')
const debug = require('./debug')

const b64Regx = /(?<match_>b64-{3}["']?(?<file_>[\w.\-/:]+)["']?-{3})/gm
const declsRegx = /^background(-image)?$|^src$/

/**
 * @param {Object<Options>} options
 * @returns {Promise}
 */
function _callback(options = {}) {
	return (css, result) => {
		const {to = process.cwd()} = result.opts
		options = {...{baseDir: dirname(to)}, ...options}
		debug.info('_callback | options ---> ', options)

		const inlines = new Set([])
		css.walkDecls(declsRegx, decl => {
			let matches
			while ((matches = b64Regx.exec(decl.value)) !== null) {
				const {file_, match_} = matches.groups
				inlines.add(_parse(file_, match_, decl, options, result))
			}
		})
		return Promise.allSettled(inlines)
	}
}

module.exports = _callback

/**
 * @typedef Options                              - postcss-inline-base64 options
 * @property {String} [baseDir=process.cwd()]    - path to load files
 */
