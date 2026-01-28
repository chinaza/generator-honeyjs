# generator-honeyjs [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]

> A Yeoman generator for scaffolding HoneyJS projects.

## Installation

First, install [Yeoman](http://yeoman.io) and generator-honeyjs using [npm](https://www.npmjs.com/) (we assume you have pre-installed [node.js](https://nodejs.org/)).

```bash
npm install -g yo
npm install -g generator-honeyjs
```

## Local Development

To use the generator locally without publishing to npm:

1. Clone or navigate to the repository:

   ```bash
   cd /path/to/generator-honeyjs
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Link the package globally:

   ```bash
   npm link
   ```

4. Run the generator:

   ```bash
   yo honeyjs
   ```

## Usage

Generate your new project:

```bash
yo honeyjs
```

The generator will prompt you for:

- **Package Name**: The name of your new project (defaults to the current folder name).

It will then scaffold a new HoneyJS project structure in the specified directory.

## License

© [chinaza](https://github.com/chinaza)

[npm-image]: https://badge.fury.io/js/generator-honeyjs.svg
[npm-url]: https://npmjs.org/package/generator-honeyjs
[travis-image]: https://travis-ci.com/chinaza/generator-honeyjs.svg?branch=master
[travis-url]: https://travis-ci.com/chinaza/generator-honeyjs
[daviddm-image]: https://david-dm.org/chinaza/generator-honeyjs.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/chinaza/generator-honeyjs
[coveralls-image]: https://coveralls.io/repos/chinaza/generator-honeyjs/badge.svg
[coveralls-url]: https://coveralls.io/r/chinaza/generator-honeyjs
