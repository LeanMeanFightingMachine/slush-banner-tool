# slush-banner-tool

## Getting started

- Install global dependencies:

```bash
npm install -g gulp slush
```

- Install generator:

```bash
npm install -g slush-banner-tool
```

## Usage

- Create a new folder for your banner and cd into it:

```bash
mkdir my-banner && cd $_
```

- Run the generator and answer the questions:

```bash
slush banner-tool
```

## Local development

### Test

- To test the generator locally run:

```
npm link
```

### Publish

- To publish a new version of the generator to NPM run:

```
npm publish
```

### Lodash templating

The tool uses [`gulp-template`](https://github.com/sindresorhus/gulp-template) to precompile lodash templates. However, the generated Gulp tasks also use this module. To prevent conflict, two different [interpolation regexs](https://lodash.com/docs#templateSettings-interpolate) are used:

- `<% %>` is used by the Slush generator
- `{{ }}` is used by the generated Gulp tasks

See the [lodash docs](https://lodash.com/docs#template) for more info.
