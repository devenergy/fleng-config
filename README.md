# fleng-config

Hierarchical [fleng](https://github.com/devenergy/fleng) configuration with YAML files and atomic object merging.

## Installation
```
npm install --save fleng-config
```

## Usage
```js
var fconf = require('fleng-config');

// Initialize config provider
var config = new fconf.Provider(__dirname);

// Add default.yaml file as `default` store
config.add('default', 'config/default.yaml');

// Add development.yaml file as `environment` store
config.add('environment', 'config/development.yaml');

// Add an object literal as `overrides` store
config.add('overrides', {
  group: {
    property: 'value'
  }
});

// Explicitly set value at path `group.property`. It cannot be overrided
config.set('group.property', 'updated value');

// Get full config as an object
config.get();

// Get `group` branch of config
config.get('group');

// Get value at path `group.property`
config.get('group.property');
```

## API
#### `new fconf.Provider([String root])`

Create a new config provider. Optional parameter `root` sets the directory
against which file paths will be resolved. If omitted `process.cwd()` will be
used.

#### `.add(String name, String filePath|Object store)`

Add a store to the config provider. If `filePath` is passed provider will
try to load a file from that path. The path is resolved against `root` passed
to the constructor or `process.cwd()`. If an object literal was passed as second
argument, it will be added to the config provider as is.

#### `.get([String path])`

Get a value by the path passed. If value was not found, method will return
`undefined`.

#### `.set(String path, * value)`

Set a value at the passed path. Values set with this method could not be
overrided later.

## Build
Module source is in [ES6 module](https://babeljs.io/docs/learn-es6/#modules)
syntax. It's built using [Babel.js](https://babeljs.io/).

Install development dependencies:
```
npm install -d
```
and run:
```
npm build
```

## Tests
Tests are written using mocha and should.js library.
To run testing install development dependencies:
```
npm install -d
```
and run:
```
npm test
```
