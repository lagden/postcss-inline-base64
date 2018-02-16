/* eslint max-len: 0 */
/* eslint object-curly-spacing: 0 */
/* eslint indent: ["error", "tab"] */
/* eslint no-return-await: 0 */
/* eslint no-empty-character-class: 0 */
/* eslint promise/prefer-await-to-then: 0 */

'use strict'

const crypto = require('crypto')
const fs = require('fs')
const {tmpdir} = require('os')
const {join} = require('path')
const {promisify} = require('util')
const postcss = require('postcss')
const got = require('got')
const checkSvg = require('is-svg')
const fileType = require('file-type')
const debug = require('debug')

const log = debug('b64:log')
const error = debug('b64:error')
const help = debug('b64:help')
const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
const mkdir = promisify(fs.mkdir)
const urlRegx = /^https?:\/\//
const b64Regx = /b64-{3}["']?([\w.\-/:]+)["']?-{3}/gm
const cacheDir = join(tmpdir(), 'b64_cache')

function _hash(dir, file) {
	return crypto.createHash('sha256').update(join(dir, file)).digest('hex')
}

async function _mkdir(dir, mode) {
	try {
		await mkdir(dir, mode)
	} catch (err) {
		error('_mkdir ---> ', err.message)
	}
	return Promise.resolve()
}

async function _find(dir, file) {
	log('find ---> ', file)
	const f = join(dir, file)
	try {
		if (urlRegx.test(file)) {
			const {body} = await got(file, {encoding: null, retries: 1, timeout: 5000})
			return body
		}
		return readFile(f)
	} catch (err) {
		error('_find ---> ', err.message)
		return Promise.reject(err)
	}
}

function _mime(buf) {
	const isSvg = checkSvg(buf.toString('utf-8'))
	if (isSvg) {
		return 'image/svg+xml'
	}
	const chunk = Buffer.alloc(262)
	buf.copy(chunk, 0, 0, 262)
	const {mime} = fileType(chunk)
	/* istanbul ignore next */
	return mime || 'application/octet-stream'
}

async function _caching(hash, result) {
	try {
		await _mkdir(cacheDir, 0o755)
		await writeFile(join(cacheDir, hash), result, {mode: 0o644})
	} catch (err) {
		/* istanbul ignore next */
		error('_caching ---> ', err.message)
	}
	return Promise.resolve()
}

async function inline(dir, file, options) {
	try {
		const buf = await _find(dir, file)
		const mime = _mime(buf)
		const result = `data:${mime};charset=utf-8;base64,${buf.toString('base64')}`
		if (options.useCache) {
			const hash = _hash(dir, file)
			await _caching(hash, result)
		}
		return result
	} catch (err) {
		error('inline ---> ', err.message)
		return false
	}
}

async function cache64(dir, file, options) {
	const hash = _hash(dir, file)
	try {
		const buf = await _find(cacheDir, hash)
		return buf.toString('utf-8')
	} catch (err) {
		error('cache64 ---> ', err.message)
		const result = await inline(dir, file, options)
		return result
	}
}

function _capture(...args) {
	const [decl, fn, options] = args
	log('decl ---> ', decl.prop, decl.value)
	const promises = []
	const decls = []
	const regs = []
	const matches = decl.value.match(b64Regx) || []
	for (const match of matches) {
		const file = match.replace(b64Regx, '$1')
		decls.push(decl)
		promises.push(fn(options.baseDir, file, options))
		regs.push(match)
	}
	return {promises, decls, regs}
}

module.exports = postcss.plugin('postcss-inline-base64', opts => {
	const options = {...{baseDir: './', useCache: true}, ...opts}
	help(options)
	const fn = options.useCache ? cache64 : inline
	let _promises = []
	let _decls = []
	let _regs = []
	return css => {
		css.walkAtRules(/^font-face$/, rule => {
			rule.walkDecls(/^src$/, decl => {
				const {promises, decls, regs} = _capture(decl, fn, options)
				_promises = [..._promises, ...promises]
				_decls = [..._decls, ...decls]
				_regs = [..._regs, ...regs]
			})
		})

		css.walkRules(rule => {
			rule.walkDecls(/^background(-image)?$/, decl => {
				const {promises, decls, regs} = _capture(decl, fn, options)
				_promises = [..._promises, ...promises]
				_decls = [..._decls, ...decls]
				_regs = [..._regs, ...regs]
			})
		})

		return Promise.all(_promises).then(inlines => {
			_decls.forEach((decl, idx) => {
				const file = _regs[idx].replace(b64Regx, '$1')
				const str = inlines[idx] || file
				decl.value = decl.value.replace(_regs[idx], str)
			})
		})
	}
})
