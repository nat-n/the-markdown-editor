(function() {
  'use strict';
  angular.module('mdApp').service('dndFile', function($rootScope) {
    var allowed_file_exts, default_drop, load_first_file_matching,
      _this = this;
    allowed_file_exts = /\.(md|litcoffee|css)$/;
    load_first_file_matching = function(files, regexp) {
      var mdfile, reader;
      if (mdfile = (function() {
        var f, _i, _len;
        for (_i = 0, _len = files.length; _i < _len; _i++) {
          f = files[_i];
          if (regexp.test(f.name)) {
            return f;
          }
        }
      })()) {
        reader = new FileReader();
        reader.onload = function(e) {
          e.fileName = mdfile.name.replace(regexp, '');
          e.fileExt = mdfile.name.match(regexp)[1];
          return _this.callbacks.fileload(e);
        };
        return reader.readAsText(mdfile);
      }
    };
    default_drop = function(e) {
      var files;
      files = e.dataTransfer.files;
      if (files.length) {
        load_first_file_matching(files, /\.(md|litcoffee)$/);
        return load_first_file_matching(files, /\.(css)$/);
      }
    };
    this.callbacks = {
      active: function(e) {},
      inactive: function(e) {},
      fileload: function(e) {},
      drop: function(e) {},
      default_drop: default_drop
    };
    return {
      init: function(elm) {
        elm.addEventListener("dragenter", function(e) {
          _.kill_event(e);
          return _this.callbacks.active(e);
        });
        elm.addEventListener("dragover", function(e) {
          _.kill_event(e);
          return _this.callbacks.active(e);
        });
        elm.addEventListener("dragexit", function(e) {
          _.kill_event(e);
          return _this.callbacks.inactive(e);
        });
        return elm.addEventListener("drop", function(e) {
          _.kill_event(e);
          _this.callbacks.drop(e);
          return _this.callbacks.default_drop(e);
        });
      },
      onactive: function(cb) {
        return _this.callbacks.active = cb;
      },
      oninactive: function(cb) {
        return _this.callbacks.inactive = cb;
      },
      onfileload: function(cb) {
        return _this.callbacks.fileload = cb;
      },
      ondrop: function(cb, replace_default) {
        _this.callbacks.drop = cb;
        return _this.callbacks.default_drop = replace_default ? (function() {}) : default_drop;
      }
    };
  });

}).call(this);
