# rollup-plugin-typescript-paths

Rollup Plugin to automatically resolve path aliases set in the `compilerOptions` section of `tsconfig.json`.

For example, if you have 

```js
// tsconfig.json
{
  "compilerOptions": {
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

