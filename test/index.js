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
	// skips if module doesn't exist
	strictEqual(plugin.resolveId('foo/baz', ''), null);

	// skips if a matching path alias isn't found
	strictEqual(plugin.resolveId('@asdf', ''), null);

	// skips if importee is a virtual module
	strictEqual(plugin.resolveId('\0@foobar', ''), null);

	// resolves with non-wildcard paths
	strictEqual(plugin.resolveId('@foobar', ''), join(__dirname, 'foo', 'bar.js'));
	strictEqual(plugin.resolveId('@foobar-react', ''), join(__dirname, 'foo', 'bar-react.js'));

	// resolves with wildcard paths
	strictEqual(plugin.resolveId('@bar/foo', ''), join(__dirname, 'bar', 'foo.js'));

	// resolves from a directory with index file
	strictEqual(plugin.resolveId('@js', ''), join(__dirname, 'js', 'index.js'));

	// resolves without an `@` prefix
	strictEqual(plugin.resolveId('bar/foo', ''), join(__dirname, 'bar', 'foo.js'));

	// resolves with a different importer
	strictEqual(plugin.resolveId('bar/foo', join(__dirname, 'foo', 'bar.ts')), join(__dirname, 'bar', 'foo.js'));

	// doesn't accidentally resolve relative paths that also have an alias
	strictEqual(plugin.resolveId('../bar/foo', join(__dirname, 'foo', 'bar.ts')), null);

	// resolves as a relative path with option `absolute: false`
	strictEqual(pluginNonAbs.resolveId('@foobar', ''), join('test', 'foo', 'bar.js'));

	// applies function from `transform` option
	strictEqual(pluginTransform.resolveId('@foobar', ''), join(__dirname, 'foo', 'bar.cjs.js'));

	// resolves including the file extension with option `preserveExtensions: true`
	strictEqual(pluginPreserveExtensions.resolveId('@foobar', ''), join(__dirname, 'foo', 'bar.ts'));
	strictEqual(pluginPreserveExtensions.resolveId('@foobar-react', ''), join(__dirname, 'foo', 'bar-react.tsx'));

	console.log('PASSED');
} catch (error) {
	throw error;
}
