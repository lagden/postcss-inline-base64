/* eslint max-len: 0 */
/* eslint object-curly-spacing: 0 */
/* eslint indent: ["error", "tab"] */

'use strict'

import {readFileSync} from 'fs'
import {join} from 'path'
import {tmpdir} from 'os'
import postcss from 'postcss'
import rmdir from 'rmdir'
import test from 'ava'
import plugin from '../.'

const cssLocal = readFileSync(join(__dirname, 'fixtures', 'local.css')).toString('utf-8')
const cssLocalOut = readFileSync(join(__dirname, 'fixtures', 'local.out.css')).toString('utf-8')
const cssExternal = readFileSync(join(__dirname, 'fixtures', 'external.css')).toString('utf-8')
const cssExternalOut = readFileSync(join(__dirname, 'fixtures', 'external.out.css')).toString('utf-8')
const cssSyntax = readFileSync(join(__dirname, 'fixtures', 'syntax.css')).toString('utf-8')
const cssSyntaxOut = readFileSync(join(__dirname, 'fixtures', 'syntax.out.css')).toString('utf-8')
const baseDir = join(__dirname, 'fixtures')

function run(t, input, opts = {}) {
	return postcss([plugin(opts)]).process(input, {from: undefined})
}

function rm(cb) {
	const cacheDir = join(tmpdir(), 'b64_cache')
	rmdir(cacheDir, () => {
		cb()
	})
}

test.cb.before(t => {
	rm(t.end)
})

test.cb.after(t => {
	rm(t.end)
})

test('cache', async t => {
	await run(t, cssSyntax, {baseDir})
	const res = await run(t, cssSyntax, {baseDir})
	t.deepEqual(cssSyntaxOut, res.css, 'different results')
	t.is(res.warnings().length, 0, 'must be 0')
})

test('local', async t => {
	const res = await run(t, cssLocal, {baseDir, useCache: false})
	t.deepEqual(cssLocalOut, res.css, 'different results')
	t.is(res.warnings().length, 0, 'must be 0')
})

test('external', async t => {
	const res = await run(t, cssExternal, {baseDir, useCache: false})
	t.deepEqual(cssExternalOut, res.css, 'different results')
	t.is(res.warnings().length, 0, 'must be 0')
})

test('file error', async t => {
	const css = '.test {background-image: url(b64---./err---);}'
	const cssOut = '.test {background-image: url(./err);}'
	const res = await run(t, css, {baseDir, useCache: false})
	t.deepEqual(cssOut, res.css, 'different results')
	t.is(res.warnings().length, 0, 'must be 0')
})

test('url error', async t => {
	const css = '.test {background-image: url(b64---"http://cdn.lagden.in/err.png"---);}'
	const cssOut = '.test {background-image: url(http://cdn.lagden.in/err.png);}'
	const res = await run(t, css, {baseDir, useCache: false})
	t.deepEqual(cssOut, res.css, 'different results')
	t.is(res.warnings().length, 0, 'must be 0')
})
