import path from 'node:path'
import {promises} from 'node:fs'
import got from 'got'
import checkSvg from 'is-svg'
import FileType from 'file-type'
import * as debug from './debug.js'

const urlRegx = /^https?:\/\//

/**
 * @param {String} dir  - file path
 * @param {String} file - file name
 * @return {Buffer} File buffer
 */
export async function _find(dir, file) {
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
export async function _mime(buf) {
	const isSvg = checkSvg(buf.toString('utf-8'))
	if (isSvg) {
		return 'image/svg+xml'
	}

	const {mime} = await FileType.fromBuffer(buf)
	return mime
}

/**
 * @typedef Buffer - Node.js class Buffer
 * @see http://nodejs.org/api/buffer.html#buffer_class_buffer
 */
