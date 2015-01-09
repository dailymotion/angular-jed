(->
  'use strict'

  defaultLang = 'en_US'
  lang = defaultLang
  i18n = false
  translationsPath = false
  pageDatas = false
  commonDatas = {}
  cache = {}

  extend = (object, properties) ->
    for key, val of properties
      object[key] = val
    object

  angular.module 'jed', []

  angular.module('jed').factory 'i18n', [
    '$http'
    '$rootScope'
    '$q'
    ($http, $rootScope, $q) ->
      readyDeferred = $q.defer()

      # Get a translation file from cache or ajax
      get = (file) ->
        deferred = $q.defer()
        varName = file.replace('.json', '')
        if window.translations and window.translations[varName]
          deferred.resolve(JSON.parse window.translations[varName])
        else if file of cache
          deferred.resolve(cache[file])
        else
          $http.get("#{translationsPath}/#{file}")
            .success (data) ->
              cache[file] = data
              deferred.resolve(data)
            .error ->
              deferred.reject()
        return deferred.promise

      # Initialize Jed
      setI18N = (data = false) ->
        i18n = if data then new Jed(data)

        $rootScope._ = (key) ->
          jed._(key)

        $rootScope._n = (singular_key, plural_key, value) ->
          jed._n(singular_key, plural_key, value)

      # Public API
      jed =
        setTranslationPath: (path) ->
          translationsPath = path
          jed

        setLang: (value) ->
          lang = value
          jed

        setDefaultLang: (lang) ->
          defaultLang = lang
          jed

        # Load common translations
        loadCommon: (common) ->
          deferred = $q.defer()
          get("#{common}-#{lang}.json").then((data) ->
            # not sure this is needed tho
            commonDatas = extend commonDatas, data.locale_data.messages
            if pageDatas
              pageDatas.locale_data.messages = extend pageDatas.locale_data.messages, commonDatas
              setI18N pageDatas
            else
              setI18N data
            readyDeferred.resolve()
            deferred.resolve()
          , ->
            readyDeferred.resolve()
            deferred.resolve()
          )
          deferred.promise

        # Load page translation
        loadPage: (page) ->
          deferred = $q.defer()
          get("#{page}-#{lang}.json").then((data) ->
            data.locale_data.messages = extend data.locale_data.messages, commonDatas
            pageDatas = data
            setI18N data
            readyDeferred.resolve()
            deferred.resolve()
          , ->
            if lang == defaultLang
              setI18N()
            else
              jed.loadPage(page)
            readyDeferred.resolve()
            deferred.resolve()
          )
          deferred.promise

        _: (key) ->
          if i18n then i18n.gettext(key) else key

        _n: (singular_key, plural_key, value) ->
          if i18n
            i18n.ngettext singular_key, plural_key, value
          else
            if value == 1 then singular_key else plural_key

        ready: ->
          readyDeferred.promise
  ]

  angular.module('jed').directive 'trans', [
    'i18n'
    (i18n) ->
      return (
        restrict: 'E'
        replace: true
        scope:
          singular: '@'
          plural: '@'
          none: '@'
          count: '='
          placeholders: '='
        template: '<span>{{ result }}</span>'
        controller: ($scope, $element) ->
          ready = false;
          _placeholders = {}
          _count = 0

          i18n.ready().then ->
            ready = true
            render(_count, _placeholders)

          render = (count, placeholders) ->
            _count = count
            _placeholders = placeholders
            return unless ready
            return unless Object.keys($scope.placeholders).length
            if $scope.count.toString() == '0' and $scope.none
              result = i18n._ $scope.none
            else
              result = i18n._n $scope.singular, $scope.plural, count
            $scope.result = _.template(result, placeholders,
              interpolate: /%([\s\S]+?)%/g
            )

          watchObjects = ['count']

          for key, name of Object.keys($scope.placeholders)
            watchObjects.push "placeholders.#{name}"

          $scope.$watchGroup(watchObjects, ->
            if typeof parseInt($scope.count) != 'number' or $scope.count == ''
              return

            render($scope.count, $scope.placeholders)
          )
      )
  ]
)()
