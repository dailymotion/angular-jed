'use strict'

app = angular.module 'app', [
  'ngRoute'
  'ngCookies'
  'jed'
]

app.config([
  '$routeProvider'
  '$locationProvider'
  ($routeProvider, $locationProvider) ->
    $routeProvider
      .when '/home',
        templateUrl: 'partials/home.html'
        controller: 'HomeController'
      .otherwise
        redirectTo: '/home'
])
.run([
  '$rootScope'
  'i18n'
  ($rootScope, i18n) ->
    defaultLang = 'en_US'
    $rootScope.getLang = ->
      if store.get('lang') then store.get('lang') else defaultLang

    i18n.setTranslationPath 'translations'
      .setDefaultLang defaultLang
      .setLang $rootScope.getLang()

    $rootScope.$on '$viewContentLoaded', Prism.highlightAll

    $rootScope.githubLink = 'https://github.com/romainberger/angular-jed'
])

app.controller('HomeController', [
  '$scope'
  'i18n'
  ($scope, i18n) ->
    i18n.loadPage('home').then ->
      $scope.title = i18n._ 'Text translated from the controller'

    $scope.nbr = 10
])

app.directive 'language', ->
  return (
    restrict: 'E'
    template: '<div>
                <span ng-repeat="lang in languages">
                  <button class="btn btn-default" ng-class="{\'btn-primary\': currentLang() == lang.value}" ng-click="changeLang(lang.value)">{{ lang.name }}</button>
                </span>
              </div>'
    controller: ($scope, $rootScope, $window, i18n) ->
      $scope.languages = [
        {
          name: 'English'
          value: 'en_US'
        }
        {
          name: 'French'
          value: 'fr_FR'
        }
      ]

      $scope.changeLang = (value) ->
        store.set 'lang', value
        $window.location.reload()

      $scope.currentLang = ->
        $rootScope.getLang()
  )
