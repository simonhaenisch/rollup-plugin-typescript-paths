# rollup-plugin-typescript-paths

[![Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fsimonhaenisch%2Frollup-plugin-typescript-paths%2Fbadge&style=flat)](https://actions-badge.atrox.dev/simonhaenisch/rollup-plugin-typescript-paths/goto)

Rollup Plugin to automatically resolve path aliases set in the `compilerOptions` section of `tsconfig.json`.

Don't use it if you're already using [rollup-plugin-typescript](https://github.com/rollup/rollup-plugin-typescript). This plugin is only for use cases where your TypeScript code has already been transpiled before `rollup` runs.

For example, if you have

```js
// tsconfig.json
{
  "compilerOptions": {
    // ...
    "baseUrl": ".",
    "paths": {
      "@utils": ["src/helpers/utils"]
    }
  }
}
```

```js
import { something } from '@utils';
```

Then this plugin will make sure that rollup knows how to resolve `@utils`.

## Features

- No config required. 😎
- Wildcards are supported. 💪
- Uses `nodeModuleNameResolver` from the Typescript API. 🤓

## Installation

```
npm install --save-dev rollup-plugin-typescript-paths
```

## Usage

```js
import { typescriptPaths } from 'rollup-plugin-typescript-paths';

export default {
  // ...
  plugins: [typescriptPaths()],
};
```

## Options

- **`absolute`:** Whether to resolve to absolute paths; defaults to `true`.
- **`nonRelative`:** Whether to resolve [non-relative paths](https://www.typescriptlang.org/docs/handbook/module-resolution.html#relative-vs-non-relative-module-imports) based on tsconfig's `baseUrl`, even if none of the `paths` are matched; defaults to `false`.
- **`preserveExtensions`:** Whether to preserve `.ts` and `.tsx` file extensions instead of having them changed to `.js`; defaults to `false`.
- **`tsConfigPath`:** Custom path to your `tsconfig.json`. Use this if the plugin can't seem to find the correct one by itself.
- **`transform`:** If the plugin successfully resolves a path, this function allows you to hook into the process and transform that path before it is returned.

## License

[MIT](/license).
