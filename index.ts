import { dirname, normalize, relative } from 'path';
import { Plugin } from 'rollup';
import { CompilerOptions, findConfigFile, nodeModuleNameResolver, parseJsonConfigFileContent, readConfigFile, sys } from 'typescript';

export const typescriptPaths = ({
	tsConfigPath = findConfigFile('./', sys.fileExists),
	absolute = true,
	transform,
}: Options = {}): Plugin => {
	const compilerOptions = getTsCompilerOptions(tsConfigPath);

	return {
		name: 'resolve-typescript-paths',
		resolveId: (importee: string, importer?: string) => {
			if (typeof importer === 'undefined' || importee.startsWith('\0') || !compilerOptions.paths) {
				return null;
			}

			const hasMatchingPath = Object.keys(compilerOptions.paths).some(path =>
				new RegExp(path.replace('*', '\\w*')).test(importee),
			);

			if (!hasMatchingPath) {
				return null;
			}

			const { resolvedModule } = nodeModuleNameResolver(importee, importer, compilerOptions, sys);

			if (!resolvedModule) {
				return null;
			}

			const { resolvedFileName } = resolvedModule;

			if (!resolvedFileName || resolvedFileName.endsWith('.d.ts')) {
				return null;
			}

			const jsFileName = normalize(resolvedFileName.replace(/\.tsx?$/i, '.js'));

			let resolved = absolute ? jsFileName : relative(compilerOptions.outDir!, jsFileName);

			if (transform) {
				resolved = transform(resolved);
			}

			return resolved;
		},
	};
};

const getTsCompilerOptions = (configPath?: string): CompilerOptions => {
	const defaults: CompilerOptions = { outDir: '.' };

	if (!configPath) {
		return defaults;
	}

	const configFile = readConfigFile(configPath, sys.readFile);

	if (!configFile.config) {
		return defaults;
	}

	const { options } = parseJsonConfigFileContent(
		configFile.config,
		sys,
		dirname(configPath)
	);

	return { ...defaults, ...options };
};

export interface Options {
	/**
	 * Custom path to your `tsconfig.json`. Use this if the plugin can't seem to
	 * find the correct one by itself.
	 */
	tsConfigPath?: string;

	/**
	 * Whether to resolve to absolute paths or not; defaults to `true`.
	 */
	absolute?: boolean;

	/**
	 * If the plugin successfully resolves a path, this function allows you to
	 * hook into the process and transform that path before it is returned.
	 */
	transform?(path: string): string;
}

/**
 * For backwards compatibility.
 */
export const resolveTypescriptPaths = typescriptPaths;

export default typescriptPaths;
