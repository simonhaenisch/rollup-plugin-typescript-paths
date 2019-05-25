const { strictEqual } = require('assert');
const { resolve } = require('path');
const { resolveTypescriptPaths } = require('../dist');

const plugin = resolveTypescriptPaths({ tsConfigPath: resolve(__dirname, 'tsconfig.json') });

const resolvedBasic = plugin.resolveId('@foobar', '');
const resolvedWildcard = plugin.resolveId('@bar/foo', '');
const resolvedJs = plugin.resolveId('@js', '');

try {
	strictEqual(plugin.resolveId('@asdf', ''), null);
	strictEqual(resolvedBasic, 'test/foo/bar.ts');
	strictEqual(resolvedWildcard, 'test/bar/foo.ts');
	strictEqual(resolvedJs, 'test/js/index.js');
	console.log('PASSED');
} catch (error) {
	throw error;
}
