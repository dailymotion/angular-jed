# Angular-Jed

Angular wrapper for [Jed](http://slexaxton.github.io/Jed/).

Check out the [gh-pages branch to see a working example](http://romainberger.github.io/angular-jed).

## Installation

    npm install --save angular-jed

or

    bower install angular-jed

## Usage

### Configuration

    angular.module('myApp', ['jed'])
      .run(['i18n'], function(i18n) {
        i18n.setTranslationPath('/path/to/translations');
      });

### Controllers

The service provides a `loadPage` method to load a page translation file. The method returns a promise to make sure the translations methods can be used safely.

    angular.module('myApp').controller('Video', [
      '$scope'
      'i18n'
    ], function($scope, i18n) {
      i18n.loadPage('video').then(function() {
        $scope.translatedText = i18n._('This text will be translated');
      });
    });

### Common translations

You can load common translations (eg. for directives) which will add to the current translations loaded. Returns a promise.

    angular.module('myApp').directive('footer', [
      'i18n'
    ], function(i18n) {
      i18n.loadCommon('footer').then(function() {
        message = i18n._('This text will be translated');
      });
    });

### Setting the language

Wherever the `i18n` service is loaded you can simply set the language:

    i18n.setLang('fr_FR');

The language is stored in local storage. Changing it will provoke a page re-load.

### Translations

### Simple translation

You can use the different methods to translate in js files: `i18n._`, `i18n._n`.
In the views, the translation methods are attached to the `$rootScope` so you can use them directly:

    <h1>{{ _('Translated title here') }}</h1>
    <h2>{{ _n('There is one cat', 'There are several cats', nbrOfCats) }}</h2>

and in directives:

    <p>{{ $root._('Directive text here') }}</p>

### Pluralization

A `trans` directive is available for more complex plural:

    <trans singular="There is one %obj%" plural="There are %number% %objs%" none="No %objs%" count="nbr" placeholders="{number: nbr, obj: object, objs: objects}"></trans>

Attributes:
* `singular` Singular text
* `plural` Plural text
* `none` (optionnal) Text to display when `count` is 0
* `count`
* `placeholders` objects containing the variables to interpolate


## API

* `setTranslationPath(path)` Set the translation path to retrieve the translation files
* `setLang(value)` Sets the language of the app
* `getLang` Returns the current language of the app
* `setDefaultLang(value)` Sets the default language
* `ready` Returns a promise resolved when the service has loaded the initial file
* `loadPage(page)` Load a page translations. Returns a promise
* `loadCommon(name)` Load common translations (footer, header...). Returns a promise
* `_(key)` Simple translation
* `_n(singular_key, plural_key, value)` Translation for plural

## Translation files

The files MUST be named with the name of the page or directive and the language: `name-fr_FR.json`.
For example calling `i18n.loadPage('video')` will load the file `video-fr_FR` (or whatever language the site is in).

The translations files are cached so they won't be loaded twice. The cache is only a js variable so it just lives during the angular app life.

If the translations files are not found the service falls back to the a default language. If even the default language file isn't found the translations method juste returns the given keys.

## Known issues

* The domains are not usable for now. The `loadCommon` method merges the messages with the current page loaded, so everything falls into the page domain. The domain are currently used for the FAQ page and the email in the website as it is nowadays.
