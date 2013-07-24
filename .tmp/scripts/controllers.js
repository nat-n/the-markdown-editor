(function() {
  'use strict';
  var default_md;

  default_md = "The Markdown Editor\n===\n\n* Edit's made on the left panel instantly render on the right\n* Drag the middle divider to resize panels\n* Drag and drop a `.md` or `.litcoffee` file into this window to load it\n* <span style='color:pink; background-color:darkred; padding:5px; border-radius:8px'>HTML is allowed too!</span>\n";

  angular.module('mdApp').controller('mdCtrl', function($scope, $http, $element, dndFile, $filter) {
    $scope.md_raw = default_md;
    $scope.dragover = false;
    dndFile.init($element[0], dndFile.onactive(function() {
      return $scope.$apply(function() {
        return $scope.dragover = true;
      });
    }));
    dndFile.oninactive(function() {
      return $scope.$apply(function() {
        return $scope.dragover = false;
      });
    });
    $element[0].addEventListener('mousemove', function() {
      return $scope.$apply(function() {
        return $scope.dragover = false;
      });
    });
    dndFile.ondrop((function(e) {
      return $scope.$apply(function() {
        return $scope.dragover = false;
      });
    }), false);
    dndFile.onfileload(function(e) {
      return $scope.$apply(function() {
        var i, name, _ref;
        if ((_ref = e.fileExt) === 'md' || _ref === 'litcoffee') {
          return $scope.md_raw = e.target.result;
        } else if (e.fileExt === 'css') {
          name = e.fileName;
          i = 0;
          while (name in $scope.style.sheets) {
            name = "" + e.fileName + " " + (++i);
          }
          $scope.style.sheets[name] = {
            source: 'dragged file',
            "native": false,
            css: e.target.result
          };
          return $scope.style.active = name;
        }
      });
    });
    $element.bind('click', function(e) {
      return $scope.$broadcast('ctrlClicked');
    });
    $scope.style = {
      active: 'markdowncss',
      sheets: {
        markdowncss: {
          source: _.corsproxy('http://kevinburke.bitbucket.org/markdowncss/markdown.css'),
          "native": true
        },
        GitHub: {
          source: '/styles/md/github.css',
          "native": true
        }
      },
      external: '',
      editor: ''
    };
    $scope.copy_style = function(e, style_name) {
      var copy, i, name;
      _.kill_event(e);
      copy = _.clone($scope.style.sheets[style_name]);
      style_name = style_name.match(/(.*?)(:? copy(:? \d+)?)?$/)[1];
      name = "" + style_name + " copy";
      i = 0;
      while (name in $scope.style.sheets) {
        name = "" + style_name + " copy " + (++i);
      }
      copy["native"] = false;
      $scope.style.sheets[name] = copy;
      return $scope.style.active = name;
    };
    $scope.delete_style = function(e, style_name) {
      _.kill_event(e);
      delete $scope.style.sheets[style_name];
      if ($scope.style.active === style_name) {
        return $scope.style.active = Object.keys($scope.style.sheets)[0];
      }
    };
    $scope.$watch('style.active', function() {
      var style;
      if ($scope.style.active in $scope.style.sheets) {
        style = $scope.style.sheets[$scope.style.active];
        if (style.css) {
          return $scope.style.editor = $filter('prettifyCSS')(style.css);
        } else {
          return $http.get(style.source).then(function(response) {
            style.css = response.data;
            return $scope.style.editor = $filter('prettifyCSS')(style.css);
          });
        }
      }
    });
    $scope.$watch('style.editor', function() {
      return $scope.style.sheets[$scope.style.active].css = $scope.style.editor;
    });
    $scope.$watch('style.external', function() {
      if (!($scope.style.external && /^(https?:\/\/)?(\w+\.)+[\w\/]+/.test($scope.style.external))) {
        return;
      }
      return $http.get(_.corsproxy($scope.style.external)).then(function(response) {
        var file_name, i, name;
        i = 0;
        file_name = $scope.style.external.match(/.+?\/(\w+)\.css/);
        name = file_name && file_name[1] || "external";
        while (name in $scope.style.sheets) {
          name = "external " + (++i);
        }
        $scope.style.sheets[name] = {
          source: $scope.style.external,
          css: response.data,
          external: true,
          edited: false
        };
        $scope.style.active = name;
        return $scope.style.external = '';
      });
    });
    $scope.message = "";
    return $scope.$watch('message', function() {
      var t0;
      t0 = new Date();
      return setTimeout((function() {
        return $scope.$apply(function() {
          if (new Date() - t0 >= 5000) {
            return $scope.message = "";
          }
        });
      }), 5000);
    });
  });

}).call(this);