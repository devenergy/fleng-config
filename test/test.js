'use strict';

// Dependencies
var should = require('should');

describe('fleng-config', function () {
  var fconf;
  var config;

  it('should load module', function () {
    fconf = require('../');
    fconf.Provider.should.be.a.Function;
  });

  it('should initialize', function () {
    config = new fconf.Provider(__dirname);
    config.should.be.instanceof(fconf.Provider);
  });

  it('should return empty object', function () {
    config.get().should.be.an.object;
    config.get().should.be.empty;
  });

  it('should load first YAML file', function () {
    config.add('default', 'config/default.yaml');
  });

  it('should set properties from the first YAML file', function () {
    should.deepEqual(config.get(), {
      group1: { key1: 'value1', key2: 'value2' },
      group2: { key1: 'value1', key2: ['value1','value2','value3'] }
    });
  });

  it('should return a single config property', function () {
    config.get('group1').should.be.an.object;
    should.deepEqual(config.get('group1'), { key1: 'value1', key2: 'value2' });
    config.get('group1.key1').should.be.equal('value1');
    config.get('group1.key2').should.be.equal('value2');

    config.get('group2').should.be.an.object;
    should.deepEqual(config.get('group2'), {
      key1: 'value1',
      key2: ['value1','value2','value3']
    });
    config.get('group2.key1').should.be.equal('value1');
    should.deepEqual(config.get('group2.key2'), ['value1','value2','value3']);
  });

  it('should load second YAML file', function () {
    config.add('environment', 'config/development.yaml');
  });

  it('should set properties from the second YAML file', function () {
    config.get('group2').should.be.an.object;
    should.deepEqual(config.get('group2'), {
      key1: 'value1-overrided',
      key2: ['value1-overrided']
    });
    config.get('group2.key1').should.be.equal('value1-overrided');
    config.get('group2.key2').should.be.an.array;
    should.deepEqual(config.get('group2.key2'), ['value1-overrided']);
  });

  it('should add a literal object and overwrite some keys', function () {
    config.add('overwrites', {
      group1: {
        key1: 'value1-overwrite',
        key2: 'value2-overwrite',
        key3: ['value3','value4']
      },
      group3: {
        key1: 'value1-new'
      }
    });

    config.get('group1.key1').should.be.equal('value1-overwrite');
    config.get('group1.key2').should.be.equal('value2-overwrite');
    should.deepEqual(config.get('group3'), { key1: 'value1-new' });
  });

  it('should set arbitrary properties', function () {
    config.set('group1.key1', 'value1-set');
    config.set('group1.key2', ['value1-set','value2-set']);

    config.get('group1.key1').should.be.equal('value1-set');
    should.deepEqual(config.get('group1.key2'), ['value1-set','value2-set']);
  });
});