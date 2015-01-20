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
          var countExp, elementText, exp, exprFn, expression, key, lastCount, ready, render, updateElementText, watchExps, whenExp, whens, _count, _i, _j, _len, _len1, _ref, _ref1;
          countExp = attr.count;
          whenExp = attr.$attr.when && element.attr(attr.$attr.when);
          whens = scope.$eval(whenExp);
          watchExps = [];
          elementText = element.text();
          lastCount = null;
          ready = false;
          _count = false;
          i18n.ready().then(function() {
            return render(_count);
          });
          if (whens) {
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
          } else {
            exprFn = $interpolate(elementText);
            _ref1 = exprFn.expressions;
            for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
              exp = _ref1[_j];
              exp = exp.split('|')[0].replace(WHITESPACE, '');
              if (__indexOf.call(watchExps, exp) < 0) {
                watchExps.push(exp);
              }
            }
            render = function(count) {
              return updateElementText(i18n._(elementText, scope));
            };
          }
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
