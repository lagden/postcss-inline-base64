'use strict'

const {readFile: _readFile} = require('fs')
const {resolve, dirname} = require('path')
const {promisify} = require('util')

const postcss = require('postcss')
const got = require('got')
const checkSvg = require('is-svg')
const FileType = require('file-type')
const debug = require('debug')

const _log = debug('b64:log')
const _error = debug('b64:err')
const _info = debug('b64:opt')

const readFile = promisify(_readFile)
const urlRegx = /^https?:\/\//
const b64Regx = /(?<match_>b64-{3}["']?(?<file_>[\w.\-/:]+)["']?-{3})/gm
const declsRegx = /^background(-image)?$|^src$/

async function _find(dir, file) {
	_log('_find | file ---> ', file)
	if (urlRegx.test(file)) {
		const body = await got(file, {retries: 2, timeout: 5000}).buffer()
		return body
	}

	const f = resolve(dir, file)
	return readFile(f)
}

async function _mime(buf) {
	const isSvg = checkSvg(buf.toString('utf-8'))
	if (isSvg) {
		return 'image/svg+xml'
	}

	const {mime} = await FileType.fromBuffer(buf)
	return mime
}

async function _inline(dir, file) {
	const buf = await _find(dir, file)
	const mime = await _mime(buf)
	return `data:${mime};charset=utf-8;base64,${buf.toString('base64')}`
}

async function _parse(...args) {
	const [file, match, decl, options, result] = args
	const node = decl.parent
	let data = file
	try {
		data = await _inline(options.baseDir, file)
	} catch (error) {
		node.warn(result, error.message)
		_error('_parse | error ---> ', error.message)
	} finally {
		decl.value = decl.value.replace(match, data)
	}
}

function _callback(options_ = {}) {
	return (css, result) => {
		const {to = process.cwd()} = result.opts
		const options = {...{baseDir: dirname(to)}, ...options_}
		_info('_callback | options ---> ', options)
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

module.exports = postcss.plugin('postcss-inline-base64', _callback)
