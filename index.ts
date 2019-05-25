import { CompilerOptions, findConfigFile, nodeModuleNameResolver, sys } from 'typescript';

export const resolveTypescriptPaths = (options: Options = {}) => {
	const compilerOptions = getCompilerOptions(options.tsConfigPath);

	return {
		name: 'resolve-typescript-paths',
		resolveId: (importee: string, importer: string) => {
			if (importee.startsWith('\0') || !compilerOptions.paths) {
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

			return resolvedFileName;
		},
	};
};

const getCompilerOptions = (configPath = findConfigFile('./', sys.fileExists)): CompilerOptions => {
	if (!configPath) {
		return {};
	}

	const configJson = sys.readFile(configPath);

	if (!configJson) {
		return {};
	}

	const config: { compilerOptions?: CompilerOptions } = JSON.parse(configJson);

	if (!config || !config.compilerOptions) {
		return {};
	}

	return config.compilerOptions;
};

export interface Options {
	tsConfigPath?: string;
}
