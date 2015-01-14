# Angular-Jed

Angular wrapper for [Jed](http://slexaxton.github.io/Jed/).

Check out the [gh-pages branch to see a working example](http://dailymotion.github.io/angular-jed).

## Installation

    npm install --save angular-jed

or

    bower install angular-jed

## Usage

### Configuration

When running your app it's on you to set the language and the path to the translations files.

```javascript
angular.module('myApp', ['jed'])
    .run(['i18n'], function(i18n) {
    i18n.setTranslationPath('/path/to/translations')
        .setLang('fr_FR');
    });
```

### Controllers

The service provides a `loadPage` method to load a page translation file. The method returns a promise to make sure the translations methods can be used safely.

```javascript
angular.module('myApp').controller('Video', [
    '$scope'
    'i18n'
    ], function($scope, i18n) {
    i18n.loadPage('video').then(function() {
    $scope.translatedText = i18n._('This text will be translated');
    });
});
```
### Common translations

You can load common translations (eg. for directives) which will add to the current translations loaded. Returns a promise.

```javascript
angular.module('myApp').directive('footer', [
    'i18n'
    ], function(i18n) {
    i18n.loadCommon('footer').then(function() {
    message = i18n._('This text will be translated');
    });
});
```
### Translations

### Filter

In the views you can use the `trans` filter:

```html
<h1>{{ 'Translated title here'|trans }}</h1>
<h2>{{ 'There is one cat'|trans:{plural: 'There are several cats', count: nbrOfCats, none: 'There are no cats'} }}</h2>
```

Options:
* `singular` Singular text
* `plural` Plural text
* `none` (optionnal) Text to display when `count` is 0
* `count`
* `placeholders` objects containing the variables to interpolate. The count is automatically added.

### Directive

A `trans` directive is available for more complex plural:

```html
<trans singular="There is one %obj%" plural="There are %number% %objs%" none="No %objs%" count="nbr" placeholders="{number: nbr, obj: object, objs: objects}"></trans>
```
The attributes are the same as the options for the filter.

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

## Known issue

The domains are not usable for now. The `loadCommon` method merges the messages with the current page loaded, so everything falls into the page domain.
