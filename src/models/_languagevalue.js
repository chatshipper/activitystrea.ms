'use strict';

const Symbol = require('es6-symbol');
const LanguageTag = require('rfc5646');
const utils = require('../utils');

const _def = Symbol('_def');

function LanguageValue(res) {
  if (!(this instanceof LanguageValue))
    return new LanguageValue(res);
  utils.throwif(!Array.isArray(res));
  var self = this;
  res.forEach(function(item) {
    var value = item['@value'];
    var language = item['@language'];
    if (language !== undefined) {
      utils.define(self, new LanguageTag(language).toString(), value);
    } else {
      self[_def] = value;
    }
  });
}

LanguageValue.system_language =
  process.env.LANG ?
    process.env.LANG.split('.')[0].replace('_','-') : 'en';

LanguageValue.prototype = {
  toString : function() {
    return this.valueOf();
  },
  valueOf : function(tag) {
    if (!tag) return this[_def] || this.valueOf(LanguageValue.system_language);
    // first check for an exact match
    var checktag = new LanguageTag(tag);
    if (this.hasOwnProperty(checktag.toString()))
      return this[checktag.toString()];
    // otherwise, search for a match
    var keys = Object.getOwnPropertyNames(this);
    for (var n = 0, l = keys.length; n < l; n++) {
      var keytag = new LanguageTag(keys[n]);
      if (keytag.suitableFor(checktag) ||
          checktag.suitableFor(keytag))
        return this[keys[n]];
    }
  }
};

module.exports = LanguageValue;
