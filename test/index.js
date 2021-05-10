#!/usr/bin/env node

const { strictEqual } = require('assert');
const { resolve, join } = require('path');
const typescriptPaths = require('../dist').default;

const transform = (path) => path.replace(/\.js$/i, '.cjs.js');

const plugin = typescriptPaths({ tsConfigPath: resolve(__dirname, 'tsconfig.json') });

const pluginNonAbs = typescriptPaths({ tsConfigPath: resolve(__dirname, 'tsconfig.json'), absolute: false });

const pluginTransform = typescriptPaths({ tsConfigPath: resolve(__dirname, 'tsconfig.json'), transform });

const pluginPreserveExtensions = typescriptPaths({
	tsConfigPath: resolve(__dirname, 'tsconfig.json'),
	preserveExtensions: true,
});

try {
	strictEqual(plugin.resolveId('@asdf', ''), null);
	strictEqual(plugin.resolveId('\0@foobar', ''), null);
	strictEqual(plugin.resolveId('@foobar', ''), join(__dirname, 'foo', 'bar.js'));
	strictEqual(plugin.resolveId('@foobar-react', ''), join(__dirname, 'foo', 'bar-react.js'));
	strictEqual(plugin.resolveId('@bar/foo', ''), join(__dirname, 'bar', 'foo.js'));
	strictEqual(plugin.resolveId('@js', ''), join(__dirname, 'js', 'index.js'));

	strictEqual(pluginNonAbs.resolveId('@foobar', ''), join('test', 'foo', 'bar.js'));

	strictEqual(pluginTransform.resolveId('@foobar', ''), join(__dirname, 'foo', 'bar.cjs.js'));

	strictEqual(pluginPreserveExtensions.resolveId('@foobar', ''), join(__dirname, 'foo', 'bar.ts'));
	strictEqual(pluginPreserveExtensions.resolveId('@foobar-react', ''), join(__dirname, 'foo', 'bar-react.tsx'));

	console.log('PASSED');
} catch (error) {
	throw error;
}
