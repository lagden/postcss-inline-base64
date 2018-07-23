'use strict'

const {readFile: _readFile} = require('fs')
const {join, dirname} = require('path')
const {promisify} = require('util')

const postcss = require('postcss')
const got = require('got')
const checkSvg = require('is-svg')
const fileType = require('file-type')
const debug = require('debug')
const pMap = require('p-map')

const log = debug('b64:log')
const error = debug('b64:err')
const info = debug('b64:opt')
const readFile = promisify(_readFile)
const urlRegx = /^https?:\/\//
const b64Regx = /b64-{3}["']?([\w.\-/:]+)["']?-{3}/gm

async function _find(dir, file) {
	log('_find ---> ', file)
	const f = join(dir, file)
	if (urlRegx.test(file)) {
		const {body} = await got(file, {encoding: null, retries: 2, timeout: 5000})
		return body
	}
	return readFile(f)
}

function _mime(buf) {
	const isSvg = checkSvg(buf.toString('utf-8'))
	if (isSvg) {
		return 'image/svg+xml'
	}
	const {mime} = fileType(buf)
	return mime
}

async function _inline(dir, file) {
	const buf = await _find(dir, file)
	const mime = _mime(buf)
	return `data:${mime};charset=utf-8;base64,${buf.toString('base64')}`
}

module.exports = postcss.plugin('postcss-inline-base64', (opts = {}) => (css, result) => {
	const {to = '.'} = result.opts
	const options = {...{baseDir: dirname(to)}, ...opts}
	info(options)
	const inlines = []
	css.walkDecls(/^background(-image)?$|^src$/, decl => {
		const matches = decl.value.match(b64Regx) || []
		for (const match of matches) {
			const file = match.replace(b64Regx, '$1')
			inlines.push({file, match, decl})
		}
	})
	return pMap(inlines, async ({file, match, decl}) => {
		const node = decl.parent
		let data = file
		try {
			data = await _inline(options.baseDir, file)
		} catch (err) {
			node.warn(result, err.message)
			error(err.message)
		} finally {
			decl.value = decl.value.replace(match, data)
		}
	})
})
