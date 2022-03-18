#!/usr/bin/env node

import process from 'node:process'
import path from 'node:path'
import {readFile} from 'node:fs/promises'
import {createWriteStream} from 'node:fs'

const packageFile = new URL(path.resolve(process.cwd(), 'package.json'), import.meta.url)
const packageBuf = await readFile(packageFile)
const packageJson = JSON.parse(packageBuf)

function _error(message) {
	process.stderr.write(message)
	process.exit(1)
}

if (Reflect.has(packageJson, 'devDependencies') === false) {
	process.stdout.write('nothing happened.')
	process.exit(0)
}

Reflect.deleteProperty(packageJson, 'devDependencies')
createWriteStream(packageFile)
	.on('finish', () => {
		process.stdout.write('devDependencies was removed.')
	})
	.on('close', () => {
		process.exit(0)
	})
	.on('error', error => {
		_error(error.message)
	})
	.end(JSON.stringify(packageJson, undefined, '  '))
