'use strict'

const {readFileSync} = require('fs')
const {join} = require('path')
const postcss = require('postcss')
const test = require('ava')
const plugin = require('..')

const baseDir = join(__dirname, 'fixtures')
const cssLocal = readFileSync(join(baseDir, 'local.css')).toString('utf-8')
const cssLocalOut = readFileSync(join(baseDir, 'local.out.css')).toString('utf-8')
const cssExternal = readFileSync(join(baseDir, 'external.css')).toString('utf-8')
const cssExternalOut = readFileSync(join(baseDir, 'external.out.css')).toString('utf-8')
const cssSyntax = readFileSync(join(baseDir, 'syntax.css')).toString('utf-8')
const cssSyntaxOut = readFileSync(join(baseDir, 'syntax.out.css')).toString('utf-8')

function run(t, input, options) {
	return postcss([plugin(options)]).process(input, {from: undefined})
}

test('syntax', async t => {
	await run(t, cssSyntax, {baseDir})
	const result = await run(t, cssSyntax, {baseDir})
	t.deepEqual(cssSyntaxOut, result.css)
	t.is(result.warnings().length, 0)
})

test('local', async t => {
	const result = await run(t, cssLocal, {baseDir: './test/fixtures'})
	t.deepEqual(cssLocalOut, result.css)
	t.is(result.warnings().length, 2)
})

test('local from <-> to', async t => {
	const result = await postcss([plugin()]).process(cssLocal, {
		from: join(baseDir, 'local.css'),
		to: join(baseDir, 'local.test.css')
	})
	t.deepEqual(cssLocalOut, result.css)
	t.is(result.warnings().length, 2)
	t.pass()
})

test('external', async t => {
	const result = await run(t, cssExternal)
	t.deepEqual(cssExternalOut, result.css)
	t.is(result.warnings().length, 0)
})

test('file error', async t => {
	const css = '.test {background-image: url(b64---./err---);}'
	const cssOut = '.test {background-image: url(./err);}'
	const result = await run(t, css)
	t.deepEqual(cssOut, result.css)
	t.is(result.warnings().length, 1)
})

test('url error', async t => {
	const css = '.test {background-image: url(b64---"http://nem.existe/err.png"---);}'
	const cssOut = '.test {background-image: url(http://nem.existe/err.png);}'
	const result = await run(t, css)
	t.deepEqual(cssOut, result.css)
	t.is(result.warnings().length, 1)
})
