"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var resolve = require("path").resolve;

var _fs = require("fs");

var existsSync = _fs.existsSync;
var readFileSync = _fs.readFileSync;

var _ = _interopRequire(require("lodash"));

var yaml = _interopRequire(require("js-yaml"));

var Provider = (function () {
  function Provider(root) {
    _classCallCheck(this, Provider);

    Object.defineProperties(this, {
      _root_: { value: root || process.cwd() },
      _stores_: { value: [] },
      _defaults_: { value: [] },
      _overrides_: { value: [] }
    });

    this._rebuildCache();
  }

  _prototypeProperties(Provider, null, {
    _rebuildCache: {
      value: function _rebuildCache() {
        var cache = this._cache_ = {};
        var stores = [].concat(this._defaults_, this._stores_, this._overrides_);
        var mergeArgs = [cache].concat(stores);

        mergeArgs.push(function (a, b) {
          if (typeof a !== typeof b) {
            return b;
          }

          if (_.isArray(a) && _.isArray(b)) {
            return b;
          }
        });

        _.merge.apply(null, mergeArgs);

        return cache;
      },
      writable: true,
      configurable: true
    },
    _addStore: {
      value: function _addStore(collection, name, store) {
        var data;

        if ("string" === typeof store) {
          var filePath = resolve(this._root_, store);

          if (existsSync(filePath)) {
            try {
              var fileData = readFileSync(filePath, "utf8");
              if (fileData.charAt(0) === "﻿") {
                fileData = fileData.substr(1);
              }

              data = yaml.safeLoad(fileData);
            } catch (ex) {
              throw new Error("Error parsing configuration file " + store + ": " + ex.message);
            }
          }
        } else if (store instanceof Provider) {
          data = store.get();
        } else {
          data = store;
        }

        if (data) {
          collection.push(data);
          this._rebuildCache();
        }
      },
      writable: true,
      configurable: true
    },
    add: {
      value: function add(name, store) {
        this._addStore(this._stores_, name, store);
      },
      writable: true,
      configurable: true
    },
    defaults: {
      value: function defaults(name, store) {
        this._addStore(this._defaults_, name, store);
      },
      writable: true,
      configurable: true
    },
    overrides: {
      value: function overrides(name, store) {
        this._addStore(this._overrides_, name, store);
      },
      writable: true,
      configurable: true
    },
    get: {
      value: function get(path) {
        if (path) {
          var parts = path.split(".");
          var target = this._cache_;
          var key = undefined;

          while (key = parts.shift()) {
            if (target && target.hasOwnProperty(key)) {
              target = target[key];
              continue;
            }
            return;
          }

          return target;
        } else {
          return this._cache_;
        }
      },
      writable: true,
      configurable: true
    },
    set: {
      value: function set(path, value) {
        var parts = path.split(".");
        var storeName = "set-" + new Date().getTime();
        var store = {};
        var target = store;
        var key;

        while (parts.length > 1) {
          key = parts.shift();
          if (!target[key] || !_.isPlainObject(target[key])) {
            target[key] = {};
          }

          target = target[key];
        }

        key = parts.shift();
        target[key] = value;

        this.overrides(storeName, store);

        return true;
      },
      writable: true,
      configurable: true
    }
  });

  return Provider;
})();

module.exports = Provider;
