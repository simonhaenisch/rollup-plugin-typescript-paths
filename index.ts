import path from 'path';
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
  const { compilerOptions } = getTsConfig(tsConfigPath);
  const outDir = compilerOptions.outDir ?? '.';

  return {
    name: 'resolve-typescript-paths',
    resolveId: (importee: string, importer?: string) => {
      const enabled = Boolean(
        compilerOptions.paths || (compilerOptions.baseUrl && nonRelative)
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
          new RegExp('^' + path.replace('*', '.+') + '$').test(importee)
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
        sys
      );

      if (!resolvedModule) {
        return null;
      }

      const { resolvedFileName } = resolvedModule;

      if (!resolvedFileName || resolvedFileName.endsWith('.d.ts')) {
        return null;
      }

      const targetFileName = path.join(
        outDir,
        preserveExtensions
          ? resolvedFileName
          : resolvedFileName.replace(/\.tsx?$/i, '.js')
      );

      const resolved = absolute
        ? sys.resolvePath(targetFileName)
        : targetFileName;

      return transform ? transform(resolved) : resolved;
    },
  };
};

const getTsConfig = (configPath?: string): TsConfig => {
  const defaults: TsConfig = { compilerOptions: { outDir: '.' } };
  if (typeof configPath !== 'string') {
    return defaults;
  }

  // Read in tsconfig.json
  const configJson = sys.readFile(configPath);
  if (configJson == null) {
    return defaults;
  }

  const { config: rootConfig } = parseConfigFileTextToJson(
    configPath,
    configJson
  );
  const rootConfigWithDefaults = {
    ...rootConfig,
    ...defaults,
    compilerOptions: {
      ...defaults.compilerOptions,
      ...(rootConfig.compilerOptions ?? {}),
    },
  };
  const resolvedConfig = handleTsConfigExtends(
    rootConfigWithDefaults,
    configPath
  );

  return resolvedConfig;
};

const handleTsConfigExtends = (
  config: TsConfig,
  rootConfigPath: string
): TsConfig => {
  if (!('extends' in config) || typeof config.extends !== 'string') {
    return config;
  }

  let extendedConfigPath;
  try {
    // Try to resolve as a module (npm)
    extendedConfigPath = require.resolve(config.extends);
  } catch (e) {
    // Try to resolve as a file relative to the current config
    extendedConfigPath = path.join(
      path.dirname(rootConfigPath),
      config.extends
    );
  }

  // Read in extended tsconfig.json
  const extendedConfig = getTsConfig(extendedConfigPath);

  // Merge base config and current config.
  // This does not handle array concatenation or nested objects,
  // besides 'compilerOptions' paths as the other options are not relevant
  config = {
    ...extendedConfig,
    ...config,
    compilerOptions: {
      ...extendedConfig.compilerOptions,
      ...config.compilerOptions,
      paths: {
        ...(extendedConfig.compilerOptions.paths ?? {}),
        ...(config.compilerOptions.paths ?? {}),
      },
    },
  };

  // Remove the "extends" field
  delete config.extends;

  return config;
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
  extends?: string;
}

/**
 * For backwards compatibility.
 */
export const resolveTypescriptPaths = typescriptPaths;

export default typescriptPaths;
