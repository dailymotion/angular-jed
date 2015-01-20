var __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

(function() {
  'use strict';
  var cache, commonDatas, defaultLang, extend, gettext, i18n, lang, ngettext, pageDatas, percentageToBraces, translationsPath;
  defaultLang = 'en_US';
  lang = defaultLang;
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
  gettext = function(key) {
    if (i18n) {
      return i18n.gettext(key);
    } else {
      return key;
    }
  };
  ngettext = function(singular_key, plural_key, value) {
    if (i18n) {
      return i18n.ngettext(singular_key, plural_key, value);
    } else {
      if (value === 1) {
        return singular_key;
      } else {
        return plural_key;
      }
    }
  };
  angular.module('jed', []);
  angular.module('jed').service('i18n', [
    '$http', '$q', '$interpolate', function($http, $q, $interpolate) {
      var get, jed, readyDeferred, setI18N;
      readyDeferred = $q.defer();
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
        return i18n = data ? new Jed(data) : void 0;
      };
      return jed = {
        setTranslationPath: function(path) {
          translationsPath = path;
          return jed;
        },
        setLang: function(value) {
          lang = value;
          return jed;
        },
        setDefaultLang: function(lang) {
          defaultLang = lang;
          return jed;
        },
        loadCommon: function(common) {
          var deferred;
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
          var deferred;
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
              jed.loadPage(page);
            }
            readyDeferred.resolve();
            return deferred.resolve();
          });
          return deferred.promise;
        },
        _: function(key, placeholders) {
          var result;
          if (placeholders == null) {
            placeholders = {};
          }
          result = gettext(key);
          result = $interpolate(result);
          return result(placeholders);
        },
        _n: function(singular, plural, count, placeholders, none) {
          var result;
          if (placeholders == null) {
            placeholders = {};
          }
          placeholders.count = count;
          count = parseFloat(count);
          if (isNaN(count)) {
            count = 0;
          }
          if ((count.toString() === '0') && none) {
            result = gettext(none);
          } else {
            result = ngettext(singular, plural, count);
          }
          result = $interpolate(result);
          return result(placeholders);
        },
        ready: function() {
          return readyDeferred.promise;
        }
      };
    }
  ]);
  angular.module('jed').directive('trans', [
    'i18n', '$interpolate', '$locale', function(i18n, $interpolate, $locale) {
      var WHITESPACE;
      WHITESPACE = new RegExp(' ', 'g');
      return {
        restrict: 'AE',
        replace: true,
        link: function(scope, element, attr) {
          var countExp, exp, exprFn, expression, key, lastCount, ready, render, updateElementText, watchExps, whenExp, whens, _count, _i, _len, _ref;
          countExp = attr.count;
          whenExp = attr.$attr.when && element.attr(attr.$attr.when);
          whens = scope.$eval(whenExp);
          watchExps = [];
          lastCount = null;
          ready = false;
          _count = false;
          i18n.ready().then(function() {
            return render(_count);
          });
          for (key in whens) {
            expression = whens[key];
            exprFn = $interpolate(expression);
            _ref = exprFn.expressions;
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              exp = _ref[_i];
              exp = exp.split('|')[0].replace(WHITESPACE, '');
              if (__indexOf.call(watchExps, exp) < 0) {
                watchExps.push(exp);
              }
            }
          }
          render = function(count) {
            var result, singular;
            result = false;
            if (count === 0 && angular.isDefined(whens[0])) {
              result = whens[0];
            }
            if (result) {
              result = i18n._(result, scope);
            } else {
              singular = whens['one'] != null ? whens['one'] : whens['one'] = whens['singular'];
              result = i18n._n(singular, whens['plural'], count, scope);
            }
            return updateElementText(result);
          };
          scope.$watch(countExp, function(newVal) {
            var count, countIsNaN, nbrCount;
            count = parseFloat(newVal);
            nbrCount = count;
            countIsNaN = isNaN(count);
            if (!countIsNaN && !(__indexOf.call(whens, count) >= 0)) {
              count = $locale.pluralCat(count);
            }
            if ((count !== lastCount) && !(countIsNaN && isNaN(lastCount))) {
              _count = nbrCount;
              render(nbrCount);
              return lastCount = nbrCount;
            }
          });
          scope.$watchGroup(watchExps, function() {
            return render(lastCount);
          });
          return updateElementText = function(text) {
            if (text) {
              return element.text(text);
            }
          };
        }
      };
    }
  ]);
  percentageToBraces = function(string) {
    var match, result, strippedMatch, _i, _len;
    result = string.match(/%.*?%/g);
    if (!result) {
      return string;
    }
    for (_i = 0, _len = result.length; _i < _len; _i++) {
      match = result[_i];
      strippedMatch = match.replace(/%/g, '');
      string = string.replace(match, '{{ ' + strippedMatch + ' }}');
    }
    return string;
  };
  return angular.module('jed').filter('trans', [
    'i18n', function(i18n) {
      var transFilter;
      transFilter = function(text, options) {
        if (options == null) {
          options = {};
        }
        text = percentageToBraces(text);
        if (options.plural) {
          options.plural = percentageToBraces(options.plural);
          options.none = percentageToBraces(options.none);
          return i18n._n(text, options.plural, options.count, options.placeholders, options.none);
        } else {
          if (options.placeholders == null) {
            options.placeholders = {};
          }
          return i18n._(text, options.placeholders);
        }
      };
      transFilter.$stateful = true;
      return transFilter;
    }
  ]);
})();

//# sourceMappingURL=data:application/json;base64,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QUMsU0FBWixHQUF3QixJQVZ4QixDQUFBO2FBWUEsWUFiRjtJQUFBLENBRm9DO0dBQXRDLEVBdk1EO0FBQUEsQ0FBRCxDQUFBLENBQUEsQ0FBQSxDQUFBIiwiZmlsZSI6ImFuZ3VsYXItamVkLmpzIiwic291cmNlUm9vdCI6Ii9zb3VyY2UvIiwic291cmNlc0NvbnRlbnQiOlsiKC0+XG4gICd1c2Ugc3RyaWN0J1xuXG4gIGRlZmF1bHRMYW5nID0gJ2VuX1VTJ1xuICBsYW5nID0gZGVmYXVsdExhbmdcbiAgaTE4biA9IGZhbHNlXG4gIHRyYW5zbGF0aW9uc1BhdGggPSBmYWxzZVxuICBwYWdlRGF0YXMgPSBmYWxzZVxuICBjb21tb25EYXRhcyA9IHt9XG4gIGNhY2hlID0ge31cblxuICBleHRlbmQgPSAob2JqZWN0LCBwcm9wZXJ0aWVzKSAtPlxuICAgIGZvciBrZXksIHZhbCBvZiBwcm9wZXJ0aWVzXG4gICAgICBvYmplY3Rba2V5XSA9IHZhbFxuICAgIG9iamVjdFxuXG4gIGdldHRleHQgPSAoa2V5KSAtPlxuICAgIGlmIGkxOG4gdGhlbiBpMThuLmdldHRleHQoa2V5KSBlbHNlIGtleVxuXG4gIG5nZXR0ZXh0ID0gKHNpbmd1bGFyX2tleSwgcGx1cmFsX2tleSwgdmFsdWUpIC0+XG4gICAgaWYgaTE4blxuICAgICAgaTE4bi5uZ2V0dGV4dCBzaW5ndWxhcl9rZXksIHBsdXJhbF9rZXksIHZhbHVlXG4gICAgZWxzZVxuICAgICAgaWYgdmFsdWUgPT0gMSB0aGVuIHNpbmd1bGFyX2tleSBlbHNlIHBsdXJhbF9rZXlcblxuICBhbmd1bGFyLm1vZHVsZSAnamVkJywgW11cblxuICBhbmd1bGFyLm1vZHVsZSgnamVkJykuc2VydmljZSAnaTE4bicsIFtcbiAgICAnJGh0dHAnXG4gICAgJyRxJ1xuICAgICckaW50ZXJwb2xhdGUnXG4gICAgKCRodHRwLCAkcSwgJGludGVycG9sYXRlKSAtPlxuICAgICAgcmVhZHlEZWZlcnJlZCA9ICRxLmRlZmVyKClcblxuICAgICAgIyBHZXQgYSB0cmFuc2xhdGlvbiBmaWxlIGZyb20gY2FjaGUgb3IgYWpheFxuICAgICAgZ2V0ID0gKGZpbGUpIC0+XG4gICAgICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKVxuICAgICAgICB2YXJOYW1lID0gZmlsZS5yZXBsYWNlKCcuanNvbicsICcnKVxuICAgICAgICBpZiB3aW5kb3cudHJhbnNsYXRpb25zIGFuZCB3aW5kb3cudHJhbnNsYXRpb25zW3Zhck5hbWVdXG4gICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShKU09OLnBhcnNlIHdpbmRvdy50cmFuc2xhdGlvbnNbdmFyTmFtZV0pXG4gICAgICAgIGVsc2UgaWYgZmlsZSBvZiBjYWNoZVxuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoY2FjaGVbZmlsZV0pXG4gICAgICAgIGVsc2VcbiAgICAgICAgICAkaHR0cC5nZXQoXCIje3RyYW5zbGF0aW9uc1BhdGh9LyN7ZmlsZX1cIilcbiAgICAgICAgICAgIC5zdWNjZXNzIChkYXRhKSAtPlxuICAgICAgICAgICAgICBjYWNoZVtmaWxlXSA9IGRhdGFcbiAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShkYXRhKVxuICAgICAgICAgICAgLmVycm9yIC0+XG4gICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgpXG4gICAgICAgIGRlZmVycmVkLnByb21pc2VcblxuICAgICAgIyBJbml0aWFsaXplIEplZFxuICAgICAgc2V0STE4TiA9IChkYXRhID0gZmFsc2UpIC0+XG4gICAgICAgIGkxOG4gPSBpZiBkYXRhIHRoZW4gbmV3IEplZCBkYXRhXG5cbiAgICAgICMgUHVibGljIEFQSVxuICAgICAgamVkID1cbiAgICAgICAgc2V0VHJhbnNsYXRpb25QYXRoOiAocGF0aCkgLT5cbiAgICAgICAgICB0cmFuc2xhdGlvbnNQYXRoID0gcGF0aFxuICAgICAgICAgIGplZFxuXG4gICAgICAgIHNldExhbmc6ICh2YWx1ZSkgLT5cbiAgICAgICAgICBsYW5nID0gdmFsdWVcbiAgICAgICAgICBqZWRcblxuICAgICAgICBzZXREZWZhdWx0TGFuZzogKGxhbmcpIC0+XG4gICAgICAgICAgZGVmYXVsdExhbmcgPSBsYW5nXG4gICAgICAgICAgamVkXG5cbiAgICAgICAgIyBMb2FkIGNvbW1vbiB0cmFuc2xhdGlvbnNcbiAgICAgICAgbG9hZENvbW1vbjogKGNvbW1vbikgLT5cbiAgICAgICAgICBkZWZlcnJlZCA9ICRxLmRlZmVyKClcbiAgICAgICAgICBnZXQoXCIje2NvbW1vbn0tI3tsYW5nfS5qc29uXCIpLnRoZW4oKGRhdGEpIC0+XG4gICAgICAgICAgICAjIG5vdCBzdXJlIHRoaXMgaXMgbmVlZGVkIHRob1xuICAgICAgICAgICAgY29tbW9uRGF0YXMgPSBleHRlbmQgY29tbW9uRGF0YXMsIGRhdGEubG9jYWxlX2RhdGEubWVzc2FnZXNcbiAgICAgICAgICAgIGlmIHBhZ2VEYXRhc1xuICAgICAgICAgICAgICBwYWdlRGF0YXMubG9jYWxlX2RhdGEubWVzc2FnZXMgPSBleHRlbmQgcGFnZURhdGFzLmxvY2FsZV9kYXRhLm1lc3NhZ2VzLCBjb21tb25EYXRhc1xuICAgICAgICAgICAgICBzZXRJMThOIHBhZ2VEYXRhc1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBzZXRJMThOIGRhdGFcbiAgICAgICAgICAgIHJlYWR5RGVmZXJyZWQucmVzb2x2ZSgpXG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKClcbiAgICAgICAgICAsIC0+XG4gICAgICAgICAgICByZWFkeURlZmVycmVkLnJlc29sdmUoKVxuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpXG4gICAgICAgICAgKVxuICAgICAgICAgIGRlZmVycmVkLnByb21pc2VcblxuICAgICAgICAjIExvYWQgcGFnZSB0cmFuc2xhdGlvblxuICAgICAgICBsb2FkUGFnZTogKHBhZ2UpIC0+XG4gICAgICAgICAgZGVmZXJyZWQgPSAkcS5kZWZlcigpXG4gICAgICAgICAgZ2V0KFwiI3twYWdlfS0je2xhbmd9Lmpzb25cIikudGhlbigoZGF0YSkgLT5cbiAgICAgICAgICAgIGRhdGEubG9jYWxlX2RhdGEubWVzc2FnZXMgPSBleHRlbmQgZGF0YS5sb2NhbGVfZGF0YS5tZXNzYWdlcywgY29tbW9uRGF0YXNcbiAgICAgICAgICAgIHBhZ2VEYXRhcyA9IGRhdGFcbiAgICAgICAgICAgIHNldEkxOE4gZGF0YVxuICAgICAgICAgICAgcmVhZHlEZWZlcnJlZC5yZXNvbHZlKClcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoKVxuICAgICAgICAgICwgLT5cbiAgICAgICAgICAgIGlmIGxhbmcgPT0gZGVmYXVsdExhbmdcbiAgICAgICAgICAgICAgc2V0STE4TigpXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIGplZC5sb2FkUGFnZSBwYWdlXG4gICAgICAgICAgICByZWFkeURlZmVycmVkLnJlc29sdmUoKVxuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpXG4gICAgICAgICAgKVxuICAgICAgICAgIGRlZmVycmVkLnByb21pc2VcblxuICAgICAgICBfOiAoa2V5LCBwbGFjZWhvbGRlcnMgPSB7fSkgLT5cbiAgICAgICAgICByZXN1bHQgPSBnZXR0ZXh0IGtleVxuICAgICAgICAgIHJlc3VsdCA9ICRpbnRlcnBvbGF0ZSByZXN1bHRcbiAgICAgICAgICByZXN1bHQgcGxhY2Vob2xkZXJzXG5cbiAgICAgICAgX246IChzaW5ndWxhciwgcGx1cmFsLCBjb3VudCwgcGxhY2Vob2xkZXJzID0ge30sIG5vbmUpIC0+XG4gICAgICAgICAgcGxhY2Vob2xkZXJzLmNvdW50ID0gY291bnRcbiAgICAgICAgICBjb3VudCA9IHBhcnNlRmxvYXQgY291bnRcbiAgICAgICAgICBpZiBpc05hTiBjb3VudFxuICAgICAgICAgICAgY291bnQgPSAwXG4gICAgICAgICAgaWYgKGNvdW50LnRvU3RyaW5nKCkgPT0gJzAnKSBhbmQgbm9uZVxuICAgICAgICAgICAgcmVzdWx0ID0gZ2V0dGV4dCBub25lXG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgcmVzdWx0ID0gbmdldHRleHQgc2luZ3VsYXIsIHBsdXJhbCwgY291bnRcblxuICAgICAgICAgIHJlc3VsdCA9ICRpbnRlcnBvbGF0ZSByZXN1bHRcbiAgICAgICAgICByZXN1bHQgcGxhY2Vob2xkZXJzXG5cbiAgICAgICAgcmVhZHk6IC0+XG4gICAgICAgICAgcmVhZHlEZWZlcnJlZC5wcm9taXNlXG4gIF1cblxuICBhbmd1bGFyLm1vZHVsZSgnamVkJykuZGlyZWN0aXZlICd0cmFucycsIFtcbiAgICAnaTE4bidcbiAgICAnJGludGVycG9sYXRlJ1xuICAgICckbG9jYWxlJ1xuICAgIChpMThuLCAkaW50ZXJwb2xhdGUsICRsb2NhbGUpIC0+XG4gICAgICBXSElURVNQQUNFID0gbmV3IFJlZ0V4cCgnICcsICdnJylcbiAgICAgIHJldHVybiAoXG4gICAgICAgIHJlc3RyaWN0OiAnQUUnXG4gICAgICAgIHJlcGxhY2U6IHRydWVcbiAgICAgICAgbGluazogKHNjb3BlLCBlbGVtZW50LCBhdHRyKSAtPlxuICAgICAgICAgIGNvdW50RXhwID0gYXR0ci5jb3VudFxuICAgICAgICAgIHdoZW5FeHAgPSBhdHRyLiRhdHRyLndoZW4gJiYgZWxlbWVudC5hdHRyIGF0dHIuJGF0dHIud2hlblxuICAgICAgICAgIHdoZW5zID0gc2NvcGUuJGV2YWwgd2hlbkV4cFxuICAgICAgICAgIHdhdGNoRXhwcyA9IFtdXG4gICAgICAgICAgbGFzdENvdW50ID0gbnVsbFxuICAgICAgICAgIHJlYWR5ID0gZmFsc2VcbiAgICAgICAgICBfY291bnQgPSBmYWxzZVxuXG4gICAgICAgICAgaTE4bi5yZWFkeSgpLnRoZW4gLT5cbiAgICAgICAgICAgIHJlbmRlcihfY291bnQpXG5cbiAgICAgICAgICBmb3Iga2V5LCBleHByZXNzaW9uIG9mIHdoZW5zXG4gICAgICAgICAgICBleHByRm4gPSAkaW50ZXJwb2xhdGUoZXhwcmVzc2lvbilcbiAgICAgICAgICAgIGZvciBleHAgaW4gZXhwckZuLmV4cHJlc3Npb25zXG4gICAgICAgICAgICAgIGV4cCA9IGV4cC5zcGxpdCgnfCcpWzBdLnJlcGxhY2UoV0hJVEVTUEFDRSwgJycpXG4gICAgICAgICAgICAgIHdhdGNoRXhwcy5wdXNoIGV4cCB1bmxlc3MgZXhwIGluIHdhdGNoRXhwc1xuXG4gICAgICAgICAgcmVuZGVyID0gKGNvdW50KSAtPlxuICAgICAgICAgICAgcmVzdWx0ID0gZmFsc2VcbiAgICAgICAgICAgIGlmIGNvdW50ID09IDAgYW5kIGFuZ3VsYXIuaXNEZWZpbmVkIHdoZW5zWzBdXG4gICAgICAgICAgICAgIHJlc3VsdCA9IHdoZW5zWzBdXG5cbiAgICAgICAgICAgIGlmIHJlc3VsdFxuICAgICAgICAgICAgICByZXN1bHQgPSBpMThuLl8gcmVzdWx0LCBzY29wZVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBzaW5ndWxhciA9IHdoZW5zWydvbmUnXSA/PSB3aGVuc1snc2luZ3VsYXInXVxuICAgICAgICAgICAgICByZXN1bHQgPSBpMThuLl9uIHNpbmd1bGFyLCB3aGVuc1sncGx1cmFsJ10sIGNvdW50LCBzY29wZVxuXG4gICAgICAgICAgICB1cGRhdGVFbGVtZW50VGV4dCByZXN1bHRcblxuICAgICAgICAgIHNjb3BlLiR3YXRjaCBjb3VudEV4cCwgKG5ld1ZhbCkgLT5cbiAgICAgICAgICAgIGNvdW50ID0gcGFyc2VGbG9hdCBuZXdWYWxcbiAgICAgICAgICAgIG5ickNvdW50ID0gY291bnRcblxuICAgICAgICAgICAgY291bnRJc05hTiA9IGlzTmFOIGNvdW50XG5cbiAgICAgICAgICAgIGlmICFjb3VudElzTmFOICYmICEoY291bnQgaW4gd2hlbnMpXG4gICAgICAgICAgICAgIGNvdW50ID0gJGxvY2FsZS5wbHVyYWxDYXQgY291bnRcblxuICAgICAgICAgICAgaWYgKGNvdW50ICE9IGxhc3RDb3VudCkgJiYgIShjb3VudElzTmFOICYmIGlzTmFOKGxhc3RDb3VudCkpXG4gICAgICAgICAgICAgIF9jb3VudCA9IG5ickNvdW50XG4gICAgICAgICAgICAgIHJlbmRlcihuYnJDb3VudClcbiAgICAgICAgICAgICAgbGFzdENvdW50ID0gbmJyQ291bnRcblxuICAgICAgICAgIHNjb3BlLiR3YXRjaEdyb3VwIHdhdGNoRXhwcywgLT5cbiAgICAgICAgICAgIHJlbmRlciBsYXN0Q291bnRcblxuICAgICAgICAgIHVwZGF0ZUVsZW1lbnRUZXh0ID0gKHRleHQpIC0+XG4gICAgICAgICAgICBlbGVtZW50LnRleHQgdGV4dCBpZiB0ZXh0XG4gICAgICApXG4gIF1cblxuICBwZXJjZW50YWdlVG9CcmFjZXMgPSAoc3RyaW5nKSAtPlxuICAgIHJlc3VsdCA9IHN0cmluZy5tYXRjaCgvJS4qPyUvZylcbiAgICByZXR1cm4gc3RyaW5nIHVubGVzcyByZXN1bHRcbiAgICBmb3IgbWF0Y2ggaW4gcmVzdWx0XG4gICAgICBzdHJpcHBlZE1hdGNoID0gbWF0Y2gucmVwbGFjZSgvJS9nLCAnJylcbiAgICAgIHN0cmluZyA9IHN0cmluZy5yZXBsYWNlKG1hdGNoLCAne3sgJyArIHN0cmlwcGVkTWF0Y2ggKyAnIH19JylcbiAgICBzdHJpbmdcblxuICBhbmd1bGFyLm1vZHVsZSgnamVkJykuZmlsdGVyICd0cmFucycsIFtcbiAgICAnaTE4bidcbiAgICAoaTE4bikgLT5cbiAgICAgIHRyYW5zRmlsdGVyID0gKHRleHQsIG9wdGlvbnMgPSB7fSkgLT5cbiAgICAgICAgdGV4dCA9IHBlcmNlbnRhZ2VUb0JyYWNlcyB0ZXh0XG4gICAgICAgIGlmIG9wdGlvbnMucGx1cmFsXG4gICAgICAgICAgb3B0aW9ucy5wbHVyYWwgPSBwZXJjZW50YWdlVG9CcmFjZXMgb3B0aW9ucy5wbHVyYWxcbiAgICAgICAgICBvcHRpb25zLm5vbmUgPSBwZXJjZW50YWdlVG9CcmFjZXMgb3B0aW9ucy5ub25lXG4gICAgICAgICAgaTE4bi5fbiB0ZXh0LCBvcHRpb25zLnBsdXJhbCwgb3B0aW9ucy5jb3VudCwgb3B0aW9ucy5wbGFjZWhvbGRlcnMsIG9wdGlvbnMubm9uZVxuICAgICAgICBlbHNlXG4gICAgICAgICAgb3B0aW9ucy5wbGFjZWhvbGRlcnMgPz0ge31cbiAgICAgICAgICBpMThuLl8gdGV4dCwgb3B0aW9ucy5wbGFjZWhvbGRlcnNcblxuICAgICAgdHJhbnNGaWx0ZXIuJHN0YXRlZnVsID0gdHJ1ZVxuXG4gICAgICB0cmFuc0ZpbHRlclxuICBdXG4pKClcbiJdfQ==