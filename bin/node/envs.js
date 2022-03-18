#!/usr/bin/env node

import process from 'node:process'

const {ENV_INCLUDE = ''} = process.env
const vals = ENV_INCLUDE.split(' ')
const envs = vals.map(v => `envs.${v} = '${process.env?.[v]}'`)

const template = `const envs = {}

${envs.join('\n')}

export default envs`

// process.stderr.write(template)
console.log(template)
process.exit(0)
