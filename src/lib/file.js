'use strict'

const {promises} = require('fs')
const path = require('path')
const got = require('got')
const checkSvg = require('is-svg')
const FileType = require('file-type')
const debug = require('./debug')

const urlRegx = /^https?:\/\//

/**
 * @param {String} dir  - file path
 * @param {String} file - file name
 * @return {Buffer} File buffer
 */
async function _find(dir, file) {
	debug.log('_find | file ---> ', file)
	const isExternal = urlRegx.test(file)
	if (isExternal) {
		const body = await got(file, {retries: 2, timeout: 5000}).buffer()
		return body
	}

	const f = path.resolve(dir, file)
	return promises.readFile(f)
}

/**
 * @param {Buffer} buf  - file buffer
 * @return {String} File MIME type
 */
async function _mime(buf) {
	const isSvg = checkSvg(buf.toString('utf-8'))
	if (isSvg) {
		return 'image/svg+xml'
	}

	const {mime} = await FileType.fromBuffer(buf)
	return mime
}

module.exports = {
	_find,
	_mime
}

/**
 * @typedef Buffer - Node.js class Buffer
 * @see http://nodejs.org/api/buffer.html#buffer_class_buffer
 */
