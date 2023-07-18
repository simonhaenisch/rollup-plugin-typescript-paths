import path from 'path';
import { Plugin } from 'rollup';
import * as ts from 'typescript';

export const typescriptPaths = ({
	absolute = true,
	nonRelative = false,
	preserveExtensions = false,
	tsConfigPath = ts.findConfigFile('./', ts.sys.fileExists),
	transform,
}: Options = {}): Plugin => {
	const compilerOptions = getTsConfig(tsConfigPath);

	return {
		name: 'resolve-typescript-paths',
		resolveId: (importee: string, importer?: string) => {
			const enabled = Boolean(
				compilerOptions.paths || (compilerOptions.baseUrl && nonRelative),
			);

			if (
				typeof importer === 'undefined' ||
				importee.startsWith('\0') ||
				!enabled
			) {
				return null;
			}

			const hasMatchingPath =
				!!compilerOptions.paths &&
				Object.keys(compilerOptions.paths).some((path) =>
					new RegExp('^' + path.replace('*', '.+') + '$').test(importee),
				);

			if (!hasMatchingPath && !nonRelative) {
				return null;
			}

			if (importee.startsWith('.')) {
				return null; // never resolve relative modules, only non-relative
			}

			const { resolvedModule } = ts.nodeModuleNameResolver(
				importee,
				importer,
				compilerOptions,
				ts.sys,
			);

			if (!resolvedModule) {
				return null;
			}

			const { resolvedFileName } = resolvedModule;

			if (!resolvedFileName || resolvedFileName.endsWith('.d.ts')) {
				return null;
			}

			// TODO: Do we need outDir as "resolvedFileName" is already correct absolute path
			const targetFileName = path.join(
				compilerOptions.outDir,
				preserveExtensions
					? resolvedFileName
					: resolvedFileName.replace(/\.tsx?$/i, '.js'),
			);

			const resolved = absolute
				? ts.sys.resolvePath(targetFileName)
				: targetFileName;

			return transform ? transform(resolved) : resolved;
		},
	};
};

const getTsConfig = (configPath?: string): TsConfig => {
	const defaults: TsConfig = { outDir: '.' };
	if (typeof configPath !== 'string') {
		return defaults;
	}

	// Define a host object that implements ParseConfigFileHost.
	// The host provides file system operations and error handling for parsing the configuration file.
	const host: ts.ParseConfigFileHost = {
		fileExists: ts.sys.fileExists,
		readFile: ts.sys.readFile,
		readDirectory: ts.sys.readDirectory,
		useCaseSensitiveFileNames: ts.sys.useCaseSensitiveFileNames,
		getCurrentDirectory: ts.sys.getCurrentDirectory,
		onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
			console.error(
				'Unrecoverable error in config file:',
				diagnostic.messageText,
			);
			process.exit(1);
		},
	};

	// Read in tsconfig.json
	const parsedCommandLine = ts.getParsedCommandLineOfConfigFile(
		configPath,
		{},
		host,
	);

	// Access the parsed tsconfig.json file options
	let resolvedConfig = {};
	if (parsedCommandLine != null) {
		resolvedConfig = parsedCommandLine.options;
	} else {
		console.error('Failed to parse TypeScript configuration file:', configPath);
		process.exit(1);
	}

	return { ...defaults, ...resolvedConfig };
};

export interface Options {
	/**
	 * Whether to resolve to absolute paths; defaults to `true`.
	 */
	absolute?: boolean;

	/**
	 * Whether to resolve non-relative paths based on tsconfig's `baseUrl`, even
	 * if none of the `paths` are matched; defaults to `false`.
	 *
	 * @see https://www.typescriptlang.org/docs/handbook/module-resolution.html#relative-vs-non-relative-module-imports
	 * @see https://www.typescriptlang.org/docs/handbook/module-resolution.html#base-url
	 */
	nonRelative?: boolean;

	/**
	 * Whether to preserve `.ts` and `.tsx` file extensions instead of having them
	 * changed to `.js`; defaults to `false`.
	 */
	preserveExtensions?: boolean;

	/**
	 * Custom path to your `tsconfig.json`. Use this if the plugin can't seem to
	 * find the correct one by itself.
	 */
	tsConfigPath?: string;

	/**
	 * If the plugin successfully resolves a path, this function allows you to
	 * hook into the process and transform that path before it is returned.
	 */
	transform?(path: string): string;
}

type TsConfig = {
	outDir: string;
} & Omit<ts.CompilerOptions, 'outDir'>;

/**
 * For backwards compatibility.
 */
export const resolveTypescriptPaths = typescriptPaths;

export default typescriptPaths;
