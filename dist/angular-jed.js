(function() {
  'use strict';
  var cache, commonDatas, defaultLang, extend, i18n, pageDatas, translationsPath;
  defaultLang = 'en_US';
  i18n = false;
  translationsPath = false;
  pageDatas = false;
  commonDatas = {};
  cache = {};
  extend = function(object, properties) {
    var key, val;
    for (key in properties) {
      val = properties[key];
      object[key] = val;
    }
    return object;
  };
  angular.module('jed', []);
  angular.module('jed').factory('i18n', [
    '$http', '$rootScope', '$q', '$window', '$cookies', function($http, $rootScope, $q, $window, $cookies) {
      var get, getLang, jed, readyDeferred, setI18N;
      readyDeferred = $q.defer();
      getLang = function() {
        if (store.get('lang')) {
          return store.get('lang');
        } else {
          return defaultLang;
        }
      };
      get = function(file) {
        var deferred, varName;
        deferred = $q.defer();
        varName = file.replace('.json', '');
        if (window.translations && window.translations[varName]) {
          deferred.resolve(JSON.parse(window.translations[varName]));
        } else if (file in cache) {
          deferred.resolve(cache[file]);
        } else {
          $http.get("" + translationsPath + "/" + file).success(function(data) {
            cache[file] = data;
            return deferred.resolve(data);
          }).error(function() {
            return deferred.reject();
          });
        }
        return deferred.promise;
      };
      setI18N = function(data) {
        if (data == null) {
          data = false;
        }
        i18n = data ? new Jed(data) : void 0;
        $rootScope._ = function(key) {
          return jed._(key);
        };
        return $rootScope._n = function(singular_key, plural_key, value) {
          return jed._n(singular_key, plural_key, value);
        };
      };
      return jed = {
        setTranslationPath: function(path) {
          return translationsPath = path;
        },
        setDefaultLang: function(lang) {
          return defaultLang = lang;
        },
        loadCommon: function(common) {
          var deferred, lang;
          lang = getLang();
          deferred = $q.defer();
          get("" + common + "-" + lang + ".json").then(function(data) {
            commonDatas = extend(commonDatas, data.locale_data.messages);
            if (pageDatas) {
              pageDatas.locale_data.messages = extend(pageDatas.locale_data.messages, commonDatas);
              setI18N(pageDatas);
            } else {
              setI18N(data);
            }
            readyDeferred.resolve();
            return deferred.resolve();
          }, function() {
            readyDeferred.resolve();
            return deferred.resolve();
          });
          return deferred.promise;
        },
        loadPage: function(page) {
          var deferred, lang;
          lang = getLang();
          deferred = $q.defer();
          get("" + page + "-" + lang + ".json").then(function(data) {
            data.locale_data.messages = extend(data.locale_data.messages, commonDatas);
            pageDatas = data;
            setI18N(data);
            readyDeferred.resolve();
            return deferred.resolve();
          }, function() {
            if (lang === defaultLang) {
              setI18N();
            } else {
              store.set('lang', defaultLang);
              jed.loadPage(page);
            }
            readyDeferred.resolve();
            return deferred.resolve();
          });
          return deferred.promise;
        },
        _: function(key) {
          if (i18n) {
            return i18n.gettext(key);
          } else {
            return key;
          }
        },
        _n: function(singular_key, plural_key, value) {
          if (i18n) {
            return i18n.ngettext(singular_key, plural_key, value);
          } else {
            if (value === 1) {
              return singular_key;
            } else {
              return plural_key;
            }
          }
        },
        setLang: function(lang) {
          store.set('lang', lang);
          $cookies.lang = lang;
          return $window.location.reload();
        },
        getLang: function() {
          return getLang();
        },
        ready: function() {
          return readyDeferred.promise;
        }
      };
    }
  ]);
  return angular.module('jed').directive('trans', [
    'i18n', function(i18n) {
      return {
        restrict: 'E',
        replace: true,
        scope: {
          singular: '@',
          plural: '@',
          none: '@',
          count: '=',
          placeholders: '='
        },
        template: '<span>{{ result }}</span>',
        controller: function($scope, $element) {
          var key, name, ready, render, watchObjects, _count, _placeholders, _ref;
          ready = false;
          _.templateSettings.interpolate = /%([\s\S]+?)%/g;
          _placeholders = {};
          _count = 0;
          i18n.ready().then(function() {
            ready = true;
            return render(_count, _placeholders);
          });
          render = function(count, placeholders) {
            var result;
            _count = count;
            _placeholders = placeholders;
            if ($scope.count.toString() === '0' && $scope.none) {
              result = i18n._($scope.none);
            } else {
              result = i18n._n($scope.singular, $scope.plural, count);
            }
            return $scope.result = _.template(result, placeholders);
          };
          watchObjects = ['count'];
          _ref = Object.keys($scope.placeholders);
          for (key in _ref) {
            name = _ref[key];
            watchObjects.push("placeholders." + name);
          }
          return $scope.$watchGroup(watchObjects, function() {
            if (typeof parseInt($scope.count) !== 'number' || $scope.count === '') {
              return;
            }
            return ready && render($scope.count, $scope.placeholders);
          });
        }
      };
    }
  ]);
})();

//# sourceMappingURL=data:application/json;base64,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QyxNQUFNLENBQUMsSUFBN0M7QUFDRSxjQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsQ0FBTCxDQUFPLE1BQU0sQ0FBQyxJQUFkLENBQVQsQ0FERjthQUFBLE1BQUE7QUFHRSxjQUFBLE1BQUEsR0FBUyxJQUFJLENBQUMsRUFBTCxDQUFRLE1BQU0sQ0FBQyxRQUFmLEVBQXlCLE1BQU0sQ0FBQyxNQUFoQyxFQUF3QyxLQUF4QyxDQUFULENBSEY7YUFGQTttQkFNQSxNQUFNLENBQUMsTUFBUCxHQUFnQixDQUFDLENBQUMsUUFBRixDQUFXLE1BQVgsRUFBbUIsWUFBbkIsRUFQVDtVQUFBLENBVFQsQ0FBQTtBQUFBLFVBa0JBLFlBQUEsR0FBZSxDQUFDLE9BQUQsQ0FsQmYsQ0FBQTtBQW9CQTtBQUFBLGVBQUEsV0FBQTs2QkFBQTtBQUNFLFlBQUEsWUFBWSxDQUFDLElBQWIsQ0FBbUIsZUFBQSxHQUFlLElBQWxDLENBQUEsQ0FERjtBQUFBLFdBcEJBO2lCQXVCQSxNQUFNLENBQUMsV0FBUCxDQUFtQixZQUFuQixFQUFpQyxTQUFBLEdBQUE7QUFDL0IsWUFBQSxJQUFHLE1BQUEsQ0FBQSxRQUFPLENBQVMsTUFBTSxDQUFDLEtBQWhCLENBQVAsS0FBaUMsUUFBakMsSUFBNkMsTUFBTSxDQUFDLEtBQVAsS0FBZ0IsRUFBaEU7QUFDRSxvQkFBQSxDQURGO2FBQUE7bUJBR0EsS0FBQSxJQUFTLE1BQUEsQ0FBTyxNQUFNLENBQUMsS0FBZCxFQUFxQixNQUFNLENBQUMsWUFBNUIsRUFKc0I7VUFBQSxDQUFqQyxFQXhCVTtRQUFBLENBVFo7T0FERixDQURGO0lBQUEsQ0FGdUM7R0FBekMsRUE3SEQ7QUFBQSxDQUFELENBQUEsQ0FBQSxDQUFBLENBQUEiLCJmaWxlIjoiYW5ndWxhci1qZWQuanMiLCJzb3VyY2VSb290IjoiL3NvdXJjZS8iLCJzb3VyY2VzQ29udGVudCI6WyIoLT5cbiAgJ3VzZSBzdHJpY3QnXG5cbiAgZGVmYXVsdExhbmcgPSAnZW5fVVMnXG4gIGkxOG4gPSBmYWxzZVxuICB0cmFuc2xhdGlvbnNQYXRoID0gZmFsc2VcbiAgcGFnZURhdGFzID0gZmFsc2VcbiAgY29tbW9uRGF0YXMgPSB7fVxuICBjYWNoZSA9IHt9XG5cbiAgZXh0ZW5kID0gKG9iamVjdCwgcHJvcGVydGllcykgLT5cbiAgICBmb3Iga2V5LCB2YWwgb2YgcHJvcGVydGllc1xuICAgICAgb2JqZWN0W2tleV0gPSB2YWxcbiAgICBvYmplY3RcblxuICBhbmd1bGFyLm1vZHVsZSAnamVkJywgW11cblxuICBhbmd1bGFyLm1vZHVsZSgnamVkJykuZmFjdG9yeSAnaTE4bicsIFtcbiAgICAnJGh0dHAnXG4gICAgJyRyb290U2NvcGUnXG4gICAgJyRxJ1xuICAgICckd2luZG93J1xuICAgICckY29va2llcydcbiAgICAoJGh0dHAsICRyb290U2NvcGUsICRxLCAkd2luZG93LCAkY29va2llcykgLT5cbiAgICAgIHJlYWR5RGVmZXJyZWQgPSAkcS5kZWZlcigpXG4gICAgICBnZXRMYW5nID0gLT5cbiAgICAgICAgaWYgc3RvcmUuZ2V0KCdsYW5nJykgdGhlbiBzdG9yZS5nZXQoJ2xhbmcnKSBlbHNlIGRlZmF1bHRMYW5nXG5cbiAgICAgICMgR2V0IGEgdHJhbnNsYXRpb24gZmlsZSBmcm9tIGNhY2hlIG9yIGFqYXhcbiAgICAgIGdldCA9IChmaWxlKSAtPlxuICAgICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcbiAgICAgICAgdmFyTmFtZSA9IGZpbGUucmVwbGFjZSgnLmpzb24nLCAnJylcbiAgICAgICAgaWYgd2luZG93LnRyYW5zbGF0aW9ucyBhbmQgd2luZG93LnRyYW5zbGF0aW9uc1t2YXJOYW1lXVxuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoSlNPTi5wYXJzZSB3aW5kb3cudHJhbnNsYXRpb25zW3Zhck5hbWVdKVxuICAgICAgICBlbHNlIGlmIGZpbGUgb2YgY2FjaGVcbiAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGNhY2hlW2ZpbGVdKVxuICAgICAgICBlbHNlXG4gICAgICAgICAgJGh0dHAuZ2V0KFwiI3t0cmFuc2xhdGlvbnNQYXRofS8je2ZpbGV9XCIpXG4gICAgICAgICAgICAuc3VjY2VzcyAoZGF0YSkgLT5cbiAgICAgICAgICAgICAgY2FjaGVbZmlsZV0gPSBkYXRhXG4gICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoZGF0YSlcbiAgICAgICAgICAgIC5lcnJvciAtPlxuICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKVxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZVxuXG4gICAgICAjIEluaXRpYWxpemUgSmVkXG4gICAgICBzZXRJMThOID0gKGRhdGEgPSBmYWxzZSkgLT5cbiAgICAgICAgaTE4biA9IGlmIGRhdGEgdGhlbiBuZXcgSmVkKGRhdGEpXG5cbiAgICAgICAgJHJvb3RTY29wZS5fID0gKGtleSkgLT5cbiAgICAgICAgICBqZWQuXyhrZXkpXG5cbiAgICAgICAgJHJvb3RTY29wZS5fbiA9IChzaW5ndWxhcl9rZXksIHBsdXJhbF9rZXksIHZhbHVlKSAtPlxuICAgICAgICAgIGplZC5fbihzaW5ndWxhcl9rZXksIHBsdXJhbF9rZXksIHZhbHVlKVxuXG4gICAgICAjIFB1YmxpYyBBUElcbiAgICAgIGplZCA9XG4gICAgICAgIHNldFRyYW5zbGF0aW9uUGF0aDogKHBhdGgpIC0+XG4gICAgICAgICAgdHJhbnNsYXRpb25zUGF0aCA9IHBhdGhcblxuICAgICAgICBzZXREZWZhdWx0TGFuZzogKGxhbmcpIC0+XG4gICAgICAgICAgZGVmYXVsdExhbmcgPSBsYW5nXG5cbiAgICAgICAgIyBMb2FkIGNvbW1vbiB0cmFuc2xhdGlvbnNcbiAgICAgICAgbG9hZENvbW1vbjogKGNvbW1vbikgLT5cbiAgICAgICAgICBsYW5nID0gZ2V0TGFuZygpXG4gICAgICAgICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG4gICAgICAgICAgZ2V0KFwiI3tjb21tb259LSN7bGFuZ30uanNvblwiKS50aGVuKChkYXRhKSAtPlxuICAgICAgICAgICAgIyBub3Qgc3VyZSB0aGlzIGlzIG5lZWRlZCB0aG9cbiAgICAgICAgICAgIGNvbW1vbkRhdGFzID0gZXh0ZW5kIGNvbW1vbkRhdGFzLCBkYXRhLmxvY2FsZV9kYXRhLm1lc3NhZ2VzXG4gICAgICAgICAgICBpZiBwYWdlRGF0YXNcbiAgICAgICAgICAgICAgcGFnZURhdGFzLmxvY2FsZV9kYXRhLm1lc3NhZ2VzID0gZXh0ZW5kIHBhZ2VEYXRhcy5sb2NhbGVfZGF0YS5tZXNzYWdlcywgY29tbW9uRGF0YXNcbiAgICAgICAgICAgICAgc2V0STE4TiBwYWdlRGF0YXNcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgc2V0STE4TiBkYXRhXG4gICAgICAgICAgICByZWFkeURlZmVycmVkLnJlc29sdmUoKVxuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpXG4gICAgICAgICAgLCAtPlxuICAgICAgICAgICAgcmVhZHlEZWZlcnJlZC5yZXNvbHZlKClcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoKVxuICAgICAgICAgIClcbiAgICAgICAgICBkZWZlcnJlZC5wcm9taXNlXG5cbiAgICAgICAgIyBMb2FkIHBhZ2UgdHJhbnNsYXRpb25cbiAgICAgICAgbG9hZFBhZ2U6IChwYWdlKSAtPlxuICAgICAgICAgIGxhbmcgPSBnZXRMYW5nKClcbiAgICAgICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcbiAgICAgICAgICBnZXQoXCIje3BhZ2V9LSN7bGFuZ30uanNvblwiKS50aGVuKChkYXRhKSAtPlxuICAgICAgICAgICAgZGF0YS5sb2NhbGVfZGF0YS5tZXNzYWdlcyA9IGV4dGVuZCBkYXRhLmxvY2FsZV9kYXRhLm1lc3NhZ2VzLCBjb21tb25EYXRhc1xuICAgICAgICAgICAgcGFnZURhdGFzID0gZGF0YVxuICAgICAgICAgICAgc2V0STE4TiBkYXRhXG4gICAgICAgICAgICByZWFkeURlZmVycmVkLnJlc29sdmUoKVxuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpXG4gICAgICAgICAgLCAtPlxuICAgICAgICAgICAgaWYgbGFuZyA9PSBkZWZhdWx0TGFuZ1xuICAgICAgICAgICAgICBzZXRJMThOKClcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgc3RvcmUuc2V0ICdsYW5nJywgZGVmYXVsdExhbmdcbiAgICAgICAgICAgICAgamVkLmxvYWRQYWdlKHBhZ2UpXG4gICAgICAgICAgICByZWFkeURlZmVycmVkLnJlc29sdmUoKVxuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpXG4gICAgICAgICAgKVxuICAgICAgICAgIGRlZmVycmVkLnByb21pc2VcblxuICAgICAgICBfOiAoa2V5KSAtPlxuICAgICAgICAgIGlmIGkxOG4gdGhlbiBpMThuLmdldHRleHQoa2V5KSBlbHNlIGtleVxuXG4gICAgICAgIF9uOiAoc2luZ3VsYXJfa2V5LCBwbHVyYWxfa2V5LCB2YWx1ZSkgLT5cbiAgICAgICAgICBpZiBpMThuXG4gICAgICAgICAgICBpMThuLm5nZXR0ZXh0IHNpbmd1bGFyX2tleSwgcGx1cmFsX2tleSwgdmFsdWVcbiAgICAgICAgICBlbHNlXG4gICAgICAgICAgICBpZiB2YWx1ZSA9PSAxIHRoZW4gc2luZ3VsYXJfa2V5IGVsc2UgcGx1cmFsX2tleVxuXG4gICAgICAgIHNldExhbmc6IChsYW5nKSAtPlxuICAgICAgICAgIHN0b3JlLnNldCAnbGFuZycsIGxhbmdcbiAgICAgICAgICAkY29va2llcy5sYW5nID0gbGFuZ1xuICAgICAgICAgICR3aW5kb3cubG9jYXRpb24ucmVsb2FkKClcblxuICAgICAgICBnZXRMYW5nOiAtPlxuICAgICAgICAgIGdldExhbmcoKVxuXG4gICAgICAgIHJlYWR5OiAtPlxuICAgICAgICAgIHJlYWR5RGVmZXJyZWQucHJvbWlzZVxuICBdXG5cbiAgYW5ndWxhci5tb2R1bGUoJ2plZCcpLmRpcmVjdGl2ZSAndHJhbnMnLCBbXG4gICAgJ2kxOG4nXG4gICAgKGkxOG4pIC0+XG4gICAgICByZXR1cm4gKFxuICAgICAgICByZXN0cmljdDogJ0UnXG4gICAgICAgIHJlcGxhY2U6IHRydWVcbiAgICAgICAgc2NvcGU6XG4gICAgICAgICAgc2luZ3VsYXI6ICdAJ1xuICAgICAgICAgIHBsdXJhbDogJ0AnXG4gICAgICAgICAgbm9uZTogJ0AnXG4gICAgICAgICAgY291bnQ6ICc9J1xuICAgICAgICAgIHBsYWNlaG9sZGVyczogJz0nXG4gICAgICAgIHRlbXBsYXRlOiAnPHNwYW4+e3sgcmVzdWx0IH19PC9zcGFuPidcbiAgICAgICAgY29udHJvbGxlcjogKCRzY29wZSwgJGVsZW1lbnQpIC0+XG4gICAgICAgICAgcmVhZHkgPSBmYWxzZVxuICAgICAgICAgIF8udGVtcGxhdGVTZXR0aW5ncy5pbnRlcnBvbGF0ZSA9IC8lKFtcXHNcXFNdKz8pJS9nO1xuICAgICAgICAgIF9wbGFjZWhvbGRlcnMgPSB7fVxuICAgICAgICAgIF9jb3VudCA9IDBcblxuICAgICAgICAgIGkxOG4ucmVhZHkoKS50aGVuIC0+XG4gICAgICAgICAgICByZWFkeSA9IHRydWVcbiAgICAgICAgICAgIHJlbmRlcihfY291bnQsIF9wbGFjZWhvbGRlcnMpXG5cbiAgICAgICAgICByZW5kZXIgPSAoY291bnQsIHBsYWNlaG9sZGVycykgLT5cbiAgICAgICAgICAgIF9jb3VudCA9IGNvdW50XG4gICAgICAgICAgICBfcGxhY2Vob2xkZXJzID0gcGxhY2Vob2xkZXJzXG4gICAgICAgICAgICBpZiAkc2NvcGUuY291bnQudG9TdHJpbmcoKSA9PSAnMCcgYW5kICRzY29wZS5ub25lXG4gICAgICAgICAgICAgIHJlc3VsdCA9IGkxOG4uXyAkc2NvcGUubm9uZVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICByZXN1bHQgPSBpMThuLl9uICRzY29wZS5zaW5ndWxhciwgJHNjb3BlLnBsdXJhbCwgY291bnRcbiAgICAgICAgICAgICRzY29wZS5yZXN1bHQgPSBfLnRlbXBsYXRlKHJlc3VsdCwgcGxhY2Vob2xkZXJzKVxuXG4gICAgICAgICAgd2F0Y2hPYmplY3RzID0gWydjb3VudCddXG5cbiAgICAgICAgICBmb3Iga2V5LCBuYW1lIG9mIE9iamVjdC5rZXlzKCRzY29wZS5wbGFjZWhvbGRlcnMpXG4gICAgICAgICAgICB3YXRjaE9iamVjdHMucHVzaCBcInBsYWNlaG9sZGVycy4je25hbWV9XCJcblxuICAgICAgICAgICRzY29wZS4kd2F0Y2hHcm91cCh3YXRjaE9iamVjdHMsIC0+XG4gICAgICAgICAgICBpZiB0eXBlb2YgcGFyc2VJbnQoJHNjb3BlLmNvdW50KSAhPSAnbnVtYmVyJyBvciAkc2NvcGUuY291bnQgPT0gJydcbiAgICAgICAgICAgICAgcmV0dXJuXG5cbiAgICAgICAgICAgIHJlYWR5ICYmIHJlbmRlcigkc2NvcGUuY291bnQsICRzY29wZS5wbGFjZWhvbGRlcnMpXG4gICAgICAgICAgKVxuICAgICAgKVxuICBdXG4pKClcbiJdfQ==