#!/usr/bin/env node

import process from 'node:process'

const {ENV_INCLUDE = ''} = process.env
const vals = ENV_INCLUDE.split(' ')
const envs = vals.map(v => {
	const val = process.env?.[v]
	try {
		// Testa os valores
		JSON.parse(val)
		return `envs.${v} = ${val}`
	} catch {
		return `envs.${v} = '${val}'`
	}
})

const template = `const envs = {}

${envs.join('\n')}

export default envs`

process.stdout.write(template)
process.exit(0)
