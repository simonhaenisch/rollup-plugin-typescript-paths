import { join } from 'path';
import { Plugin } from 'rollup';
import {
	CompilerOptions,
	findConfigFile,
	nodeModuleNameResolver,
	parseConfigFileTextToJson,
	sys,
} from 'typescript';

export const typescriptPaths = ({
	absolute = true,
	nonRelative = false,
	preserveExtensions = false,
	tsConfigPath = findConfigFile('./', sys.fileExists),
	transform,
}: Options = {}): Plugin => {
	const { compilerOptions, outDir } = getTsConfig(tsConfigPath);

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
					new RegExp('^' + escapeRegex(path.replace('*', '.+')) + '$').test(
						importee,
					),
				);

			if (!hasMatchingPath && !nonRelative) {
				return null;
			}

			if (importee.startsWith('.')) {
				return null; // never resolve relative modules, only non-relative
			}

			const { resolvedModule } = nodeModuleNameResolver(
				importee,
				importer,
				compilerOptions,
				sys,
			);

			if (!resolvedModule) {
				return null;
			}

			const { resolvedFileName } = resolvedModule;

			if (!resolvedFileName || resolvedFileName.endsWith('.d.ts')) {
				return null;
			}

			const targetFileName = join(
				outDir,
				preserveExtensions
					? resolvedFileName
					: resolvedFileName.replace(/\.tsx?$/i, '.js'),
			);

			const resolved = absolute
				? sys.resolvePath(targetFileName)
				: targetFileName;

			return transform ? transform(resolved) : resolved;
		},
	};
};

const getTsConfig = (configPath?: string): TsConfig => {
	const defaults: TsConfig = { compilerOptions: {}, outDir: '.' };

	if (!configPath) {
		return defaults;
	}

	const configJson = sys.readFile(configPath);

	if (!configJson) {
		return defaults;
	}

	const { config } = parseConfigFileTextToJson(configPath, configJson);

	return { ...defaults, ...config };
};

/**
 * Escapes $ and ^ characters in the given string. This is necessary if you
 * want to use `$/*` in your paths, for example.
 */
const escapeRegex = (str: string) => {
	return str.replace(/[$^]/g, '\\$&');
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

interface TsConfig {
	compilerOptions: CompilerOptions;
	outDir: string;
}

/**
 * For backwards compatibility.
 */
export const resolveTypescriptPaths = typescriptPaths;

export default typescriptPaths;
