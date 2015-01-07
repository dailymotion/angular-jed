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
  'i18n'
  ($rootScope, i18n) ->
    i18n.setTranslationPath '/translations'

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
      i18n.setLang value

    $rootScope.isLang = (value) ->
      i18n.getLang() == value
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
