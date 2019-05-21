const { strictEqual } = require('assert');
const { resolve } = require('path');
const { resolveTypescriptPaths } = require('../dist');

const plugin = resolveTypescriptPaths({ tsConfigPath: resolve(__dirname, 'tsconfig.json') });

const resolved = plugin.resolveId('@foobar', '');

try {
	strictEqual(resolved, 'test/foo/bar.js');
	console.log('PASSED');
} catch (error) {
	throw error;
}
