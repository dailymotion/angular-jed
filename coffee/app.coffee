'use strict'

app = angular.module 'app', ['ngRoute', 'ngCookies', 'jed']

app.config([
  '$routeProvider',
  '$locationProvider'
  ($routeProvider, $locationProvider) ->
    $routeProvider
      .when '/home',
        templateUrl: 'partials/home.html'
        controller: 'HomeController'
      .when '/other',
        templateUrl: 'partials/other.html'
        controller: 'OtherController'
      .otherwise
        redirectTo: '/home'
])
.run([
  '$rootScope'
  '$window'
  'i18n'
  ($rootScope, $window, i18n) ->
    defaultLang = 'en_US'
    getLang = ->
      if store.get('lang') then store.get('lang') else defaultLang

    i18n.setTranslationPath 'translations'
      .setDefaultLang defaultLang
      .setLang getLang()

    $rootScope.languages = [
      {
        name: 'English'
        value: 'en_US'
      }
      {
        name: 'French'
        value: 'fr_FR'
      }
    ]

    $rootScope.changeLang = (value) ->
      store.set 'lang', value
      $window.location.reload()

    $rootScope.currentLang = ->
      getLang()
])

app.controller('HomeController', [
  '$scope'
  'i18n'
  ($scope, i18n) ->
    i18n.loadPage('home').then ->
      $scope.title = i18n._ 'Text translated from the controller'

    $scope.nbr = 10
    $scope.object = 'object'
    $scope.objects = 'objects'
    $scope.simplePlural = 2
])

app.controller('OtherController', [
  'i18n'
  (i18n) ->
    i18n.loadPage 'other'
])
