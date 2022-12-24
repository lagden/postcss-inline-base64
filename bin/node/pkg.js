#!/usr/bin/env node

import path from 'node:path'
import {pathToFileURL} from 'node:url'
import {createWriteStream} from 'node:fs'
import {readFile} from 'node:fs/promises'
import {promisify} from 'node:util'
import child_process from 'node:child_process'

const exec = promisify(child_process.exec)

const packageFile = pathToFileURL(path.resolve(process.cwd(), 'package.json'))
const packageBuf = await readFile(packageFile)
const packageJson = JSON.parse(packageBuf)

const {
	dependencies,
	devDependencies,
} = packageJson

let cc = 0

function _error(message) {
	process.stderr.write(message)
	process.exit(1)
}

function getLatestVersionPackage(data, prop) {
	if (!data) {
		return Promise.resolve('no data to show')
	}

	const keys = Object.keys(data)
	return Promise.allSettled(
		keys.map(async name => {
			const cmd = `npm show ${name} version`
			let {stdout: version} = await exec(cmd)
			version = String(version).replace('\n', '')
			if (version && data[name] !== String(version)) {
				cc++
				process.stdout.write(`${name} --> ${version}\n`)
				packageJson[prop][name] = version
				return {name, version}
			}
		}),
	)
}

try {
	await Promise.all([
		getLatestVersionPackage(dependencies, 'dependencies'),
		getLatestVersionPackage(devDependencies, 'devDependencies'),
	])

	createWriteStream(packageFile)
		.on('finish', () => {
			process.stdout.write(cc > 0 ? 'All writes are now complete.' : 'No updates')
		})
		.on('close', () => {
			process.exit(0)
		})
		.on('error', error => {
			_error(error.message)
		})
		.end(`${JSON.stringify(packageJson, undefined, '  ')}\n`)
} catch (error) {
	_error(error.message)
}
