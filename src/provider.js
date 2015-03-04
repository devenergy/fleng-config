import {resolve} from 'path'
import {existsSync, readFileSync} from 'fs'
import _ from 'lodash'
import yaml from 'js-yaml'

class Provider {
  constructor(root) {
    Object.defineProperties(this, {
      '_root_': { value: root || process.cwd() },
      '_stores_': { value: [] },
      '_overrides_': { value: {} }
    })

    this._rebuildCache()
  }

  _rebuildCache() {
    var cache = this._cache_ = {}
    var stores = this._stores_.concat([this._overrides_])
    var mergeArgs = [cache].concat(stores)

    mergeArgs.push((a, b) => {
      if (typeof a !== typeof b) {
        return b
      }

      if (_.isArray(a) && _.isArray(b)) {
        return b
      }
    })

    _.merge.apply(null, mergeArgs)

    return cache
  }

  add(name, store) {
    var data

    if ('string' === typeof store) {
      let filePath = resolve(this._root_, store)

      if (existsSync(filePath)) {
        try {
          let fileData = readFileSync(filePath, 'utf8')
          if (fileData.charAt(0) === '\uFEFF') {
            fileData = fileData.substr(1)
          }

          data = yaml.safeLoad(fileData)
        }
        catch (ex) {
          throw new Error(`Error parsing configuration file ${store}: ${ex.message}`)
        }
      }
    }
    else if (store instanceof Provider) {
      data = store.get()
    }
    else {
      data = store
    }

    if (data) {
      this._stores_.push(data)
      this._rebuildCache()
    }
  }

  get(path) {
    if (path) {
      let parts = path.split('.')
      let target = this._cache_
      let key

      while (key = parts.shift()) {
        if (target && target.hasOwnProperty(key)) {
          target = target[key]
          continue
        }
        return
      }

      return target
    }

    else {
      return this._cache_
    }
  }

  set(path, value) {
    var store = this._overrides_
    var parts = path.split('.')
    var target = store
    var key

    while (parts.length > 1) {
      key = parts.shift()
      if (!target[key] || !_.isPlainObject(target[key])) {
        target[key] = {}
      }

      target = target[key]
    }

    key = parts.shift()
    target[key] = value

    this._rebuildCache()

    return true
  }
}

export default Provider