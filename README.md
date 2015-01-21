# Angular-Jed [![Build Status](https://secure.travis-ci.org/dailymotion/angular-jed.png)](http://travis-ci.org/dailymotion/angular-jed)

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
  .run(['i18n', function(i18n) {
    i18n.setTranslationPath('/path/to/translations')
      .setLang('fr_FR');
  }]);
```

### Controllers

The service provides a `loadPage` method to load a page translation file. The method returns a promise to make sure the translations methods can be used safely.

```javascript
angular.module('myApp')
  .controller('Video', [
    '$scope',
    'i18n',
    function($scope, i18n) {
      i18n.loadPage('video').then(function() {
        $scope.translatedText = i18n._('This text will be translated');
        $scope.textWithVariable = i18n._('{{ username }} is the king of the pop', {username: 'Michael Jackson'});
      });
    }
]);
```
### Common translations

You can load common translations (eg. for directives) which will add to the current translations loaded. Returns a promise.

```javascript
angular.module('myApp')
  .directive('footer', ['i18n', function(i18n) {
    i18n.loadCommon('footer').then(function() {
      message = i18n._('This text will be translated');
    });
  }
]);
```
### Translations

A `trans` directive as a tag or attribute:

```html
<trans>{{ username }} is the king of the pop</trans>
<trans count="nbr"
       when="{
         one: '{{ username }} has one apple',
         plural: '{{ username }} has {{ nbr }} apples',
         none: '{{ username }} has no apples'
       }">
</trans>
```

### Filter

In the views you can use the `trans` filter. Less readable and you need to pass the variables but you can use it where you can put tags (eg. attributes).

```html
<h1>{{ 'Translated title here'|trans }}</h1>
<h2>{{ 'There is one cat'|trans:{plural: 'There are several cats', count: nbrOfCats, none: 'There are no cats'} }}</h2>
<a href="http://dailymotion.github.io/angular-jed/" title="{{ 'Read the documentation'|trans }}">{{ 'Link to the documentation'|trans }}</a>
```

Options:
* `singular` Singular text
* `plural` Plural text
* `none` (optionnal) Text to display when `count` is 0
* `count`
* `placeholders` objects containing the variables to interpolate. The count is automatically added.

### Directive

## API

* `setTranslationPath(path)` Set the translation path to retrieve the translation files
* `setLang(value)` Sets the language of the app
* `getLang` Returns the current language of the app
* `setDefaultLang(value)` Sets the default language
* `ready` Returns a promise resolved when the service has loaded the initial file
* `loadPage(page)` Load a page translations. Returns a promise
* `loadCommon(name)` Load common translations (footer, header...). Returns a promise
* `_(key, placeholders)` Simple translation
* `_n(singular_key, plural_key, value, placeholders, none)` Translation for plural

## Translation files

The files MUST be named with the name of the page or directive and the language: `name-fr_FR.json`.
For example calling `i18n.loadPage('video')` will load the file `video-fr_FR` (or whatever language the site is in).

The translations files are cached so they won't be loaded twice. The cache is only a js variable so it just lives during the angular app life.

For better performances, you can also include your translations json in `window.translations` to avoid ajax requests. Angular-jed will automatically use them instead of loading them from a server.

If the translations files are not found the service falls back to the a default language. If even the default language file isn't found the translations method juste returns the given keys.

## Known issue

The domains are not usable for now. The `loadCommon` method merges the messages with the current page loaded, so everything falls into the page domain.
