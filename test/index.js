#!/usr/bin/env node

const { strictEqual } = require('assert');
const { resolve, join } = require('path');
const { resolveTypescriptPaths } = require('../dist');

const transform = path => path.replace(/\.js$/i, '.cjs.js');

const plugin = resolveTypescriptPaths({ tsConfigPath: resolve(__dirname, 'tsconfig.json') });
const pluginNonAbs = resolveTypescriptPaths({ tsConfigPath: resolve(__dirname, 'tsconfig.json'), absolute: false });
const pluginTransform = resolveTypescriptPaths({ tsConfigPath: resolve(__dirname, 'tsconfig.json'), transform });

try {
	strictEqual(plugin.resolveId('@asdf', ''), null);
	strictEqual(plugin.resolveId('\0@foobar', ''), null);
	strictEqual(plugin.resolveId('@foobar', ''), join(__dirname, 'foo', 'bar.js'));
	strictEqual(plugin.resolveId('@bar/foo', ''), join(__dirname, 'bar', 'foo.js'));
	strictEqual(plugin.resolveId('@js', ''), join(__dirname, 'js', 'index.js'));

	strictEqual(pluginNonAbs.resolveId('@foobar', ''), join('test', 'foo', 'bar.js'));

	strictEqual(pluginTransform.resolveId('@foobar', ''), join(__dirname, 'foo', 'bar.cjs.js'));
	console.log('PASSED');
} catch (error) {
	throw error;
}
