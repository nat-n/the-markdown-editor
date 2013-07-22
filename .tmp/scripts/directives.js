(function() {
  'use strict';
  angular.module('mdApp').directive('adjustableRow', function() {
    return {
      restrict: 'E',
      transclude: true,
      scope: {},
      replace: true,
      template: '<div class="adjustable-row" ng-transclude></div>',
      controller: function($scope, $element, $compile) {
        var cols, dragged, right_percentage,
          _this = this;
        $scope.row = $element[0];
        cols = $scope.$parent.cols = $scope.cols = [];
        this.equalCols = function(ncols) {
          var c, new_ratio, _i, _len, _results;
          ncols || (ncols = ((function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = cols.length; _i < _len; _i++) {
              c = cols[_i];
              if (c.show) {
                _results.push(c);
              }
            }
            return _results;
          })()).length);
          new_ratio = 1 / ncols;
          _results = [];
          for (_i = 0, _len = cols.length; _i < _len; _i++) {
            c = cols[_i];
            if (c.show) {
              c.ratio = new_ratio;
              c.percentage = "" + (new_ratio * 100) + "%";
              _results.push(c.right_percentage = right_percentage(c.index));
            } else {
              c.ratio = 0;
              c.percentage = "0%";
              _results.push(c.right_percentage = right_percentage(c.index));
            }
          }
          return _results;
        };
        this.findLastCol = function() {
          var c, last_shown, _i, _len;
          last_shown = null;
          for (_i = 0, _len = cols.length; _i < _len; _i++) {
            c = cols[_i];
            c.last_shown = false;
            if (c.show) {
              last_shown = c;
            }
          }
          if (last_shown) {
            return last_shown.last_shown = true;
          }
        };
        this.addCol = function(col) {
          var _this = this;
          return $scope.$apply(function() {
            col.index = cols.length;
            cols.push(col);
            _this.equalCols();
            return col.div.append($compile('<dragarea ng-show="!last_shown"></dragarea>')(col));
          });
        };
        right_percentage = function(index) {
          var c;
          return "" + ((((function() {
            var _i, _len, _results;
            _results = [];
            for (_i = 0, _len = cols.length; _i < _len; _i++) {
              c = cols[_i];
              if (c.index <= index) {
                _results.push(c.ratio);
              }
            }
            return _results;
          })()).reduce((function(t, s) {
            return t + s;
          }), 0)) * 100) + "%";
        };
        dragged = function(x) {
          return $scope.$apply(function() {
            var after, before, c, cumRatio, i;
            before = $scope.dragging;
            after = cols[i = before.index + 1];
            while (!after.show) {
              after = cols[++i];
            }
            cumRatio = ((function() {
              var _i, _len, _results;
              _results = [];
              for (_i = 0, _len = cols.length; _i < _len; _i++) {
                c = cols[_i];
                if (c.index < before.index) {
                  _results.push(c.ratio);
                }
              }
              return _results;
            })()).reduce((function(t, s) {
              return t + s;
            }), 0);
            before.ratio = x / _this.row_width - cumRatio;
            if (before.ratio < 0.1) {
              before.ratio = 0.1;
            }
            after.ratio = 1 - ((function() {
              var _results;
              _results = [];
              for (i in cols) {
                if (parseInt(i) !== after.index) {
                  _results.push(cols[i].ratio);
                }
              }
              return _results;
            })()).reduce((function(t, s) {
              return t + s;
            }), 0);
            if (after.ratio < 0.1) {
              after.ratio = 0.1;
              before.ratio = 1 - ((function() {
                var _results;
                _results = [];
                for (i in cols) {
                  if (parseInt(i) !== before.index) {
                    _results.push(cols[i].ratio);
                  }
                }
                return _results;
              })()).reduce((function(t, s) {
                return t + s;
              }), 0);
            }
            before.percentage = "" + (before.ratio * 100) + "%";
            after.percentage = "" + (after.ratio * 100) + "%";
            return before.right_percentage = right_percentage(before.index);
          });
        };
        (window.onresize = function() {
          return _this.row_width = $scope.row.offsetWidth;
        })();
        this.start_drag = function(col, e) {
          _.kill_event(e);
          return $scope.dragging = col;
        };
        document.onmousemove = function(e) {
          _.kill_event(e);
          if ($scope.dragging) {
            return dragged(e.clientX);
          }
        };
        return document.onmouseup = function() {
          return $scope.dragging = null;
        };
      }
    };
  }).directive('adjustablecol', function() {
    return {
      require: '^adjustableRow',
      restrict: 'E',
      transclude: true,
      scope: {
        name: '@',
        show: '@'
      },
      replace: true,
      template: '<div class="adjustable-col" ng-transclude ng-style="{width: percentage}" ng-show="show"></div>',
      controller: function($scope) {
        return $scope.$watch('show', function() {
          $scope.ctrl.equalCols();
          return $scope.ctrl.findLastCol();
        });
      },
      link: function(scope, elm, attrs, adjustableRowCtrl) {
        scope.div = elm;
        scope.ctrl = adjustableRowCtrl;
        return setTimeout((function() {
          scope.show = !!scope.show;
          return adjustableRowCtrl.addCol(scope);
        }), 0);
      }
    };
  }).directive('dragarea', function() {
    return {
      restrict: 'E',
      replace: true,
      template: '<div class="dragarea" ng-style="{left: right_percentage}">፧</div>',
      scope: false,
      link: function(scope, elm, attrs) {
        return elm.bind('mousedown', function(e) {
          return scope.ctrl.start_drag(scope, e);
        });
      }
    };
  }).controller('menuCtrl', function($scope, $element, $rootScope) {
    $scope.show = false;
    $scope.$on('ctrlClicked', function() {
      return $scope.$apply(function() {
        return $scope.show = false;
      });
    });
    return $element[0].children[0].addEventListener('click', function(e) {
      var show;
      _.kill_event(e);
      show = $scope.show = !$scope.show;
      $rootScope.$broadcast('ctrlClicked');
      return $scope.$apply(function() {
        return $scope.show = show;
      });
    });
  }).directive('themeMenu', function($rootScope) {
    return {
      restrict: 'E',
      replace: true,
      scope: true,
      template: '<div id="theme-menu" class="menu">' + '<span class="menu-title">Themes ▾</span>' + '<ul class="menu-items" ng-show="show">' + '<li class="menu-item" ng-repeat="(style, props) in style.sheets" ng-click="$parent.style.active=style" ng-class="{active_style:$parent.style.active==style}">{{style}}' + '<ul class="menu-actions">' + '<li class="icon-trash" ng-click="!props.native && delete_style($event, style)" ng-class="{inactive:props.native}" title="Delete styles"></li>' + '<li class="icon-copy" ng-click="copy_style($event, style)" title="Duplicate styles"></li>' + '<li class="icon-save" ng-show="false" title="Save styles"></li>' + '</ul>' + '</li>' + '<li class="menu-item" ng-click="select_ext($event)" ng-class="{active_style:style.active==\'external\'}">' + '<label for="external-css">External: </label>' + '<input id="styles_external" ng-model="style.external"  ng-keydown="keydown_input($event)" type="text" name="external-css" id="external-css" placeholder="http://">' + '</li>' + '</ul>' + '</div>',
      controller: 'menuCtrl',
      link: function(scope, elm, attrs, $rootScope) {
        scope.select_ext = function(e) {
          _.kill_event(e);
          return styles_external.focus();
        };
        return styles_external.onkeydown = function(e) {
          if ((e.which || e.keyCode) === 13) {
            return scope.$apply(function() {
              return scope.show = false;
            });
          }
        };
      }
    };
  }).directive('viewMenu', function($rootScope) {
    return {
      restrict: 'E',
      replace: true,
      scope: true,
      template: '<div id="view-menu" class="menu">' + '<span class="menu-title">View ▾</span>' + '<ul class="menu-items" ng-show="show">' + '<li class="menu-item" ng-repeat="col in cols" ng-class="{active_col:col.show}" ng-click="col.show=!col.show">{{col.name}}</li>' + '</ul>' + '</div>',
      controller: 'menuCtrl'
    };
  });

}).call(this);
