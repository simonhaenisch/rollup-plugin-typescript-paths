#!/usr/bin/env node

const { strictEqual } = require('assert');
const { resolve } = require('path');
const { resolveTypescriptPaths } = require('../dist');

const plugin = resolveTypescriptPaths({ tsConfigPath: resolve(__dirname, 'tsconfig.json') });

try {
	strictEqual(plugin.resolveId('@asdf', ''), null);
	strictEqual(plugin.resolveId('\0@foobar', ''), null);
	strictEqual(plugin.resolveId('@foobar', ''), 'test/foo/bar.ts');
	strictEqual(plugin.resolveId('@bar/foo', ''), 'test/bar/foo.ts');
	strictEqual(plugin.resolveId('@js', ''), 'test/js/index.js');

	console.log('PASSED');
} catch (error) {
	throw error;
}
