'use strict'

const postcss = require('postcss')
const _callback = require('./lib/cb')

/**
 *
 * @type {Plugin}
 */
module.exports = postcss.plugin('postcss-inline-base64', _callback)
