# rollup-plugin-typescript-paths

[![Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Fsimonhaenisch%2Frollup-plugin-typescript-paths%2Fbadge&style=flat)](https://actions-badge.atrox.dev/simonhaenisch/rollup-plugin-typescript-paths/goto)

Rollup Plugin to automatically resolve path aliases set in the `compilerOptions` section of `tsconfig.json`.

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
import { resolveTypescriptPaths } from 'rollup-plugin-typescript-paths';

export default {
  // ...
  plugins: [
    resolveTypescriptPaths()
  ]
}
```

## Options

* **`tsConfigPath`:** If the plugin has trouble finding your `tsconfig.json`, you can pass the path to it via this option.

## License

[MIT](/license).

