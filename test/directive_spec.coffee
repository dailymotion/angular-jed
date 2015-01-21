'use strict'

translations =
  domain: "messages"
  locale_data:
    messages:
      '':
        domain: "messages"
        plural_forms: "nplurals=2; plural=(n > 1);"
        lang: "fr"
      "This is a test": [null, "Ceci est un test"]
      "{{ username }} is not a test": [null, "{{ username }} n'est pas un test"]
      "Nothing to see here": [null, "Rien a voir ici"]
      "One thing here": ["Un tas de trucs ici", "Un truc ici", "Un tas de trucs ici"]

describe 'trans directive', ->
  compile = $rootScope = null

  simpleTrans = '<trans>This is a test</trans>'
  variableTrans = '<trans>{{ username }} is not a test</trans>'
  transAttr = '<h1 trans>This is a test</h1>'
  pluralTrans = '<trans count="nbr"
        when="{
          0: \'Nothing to see here\',
          one: \'One thing here\',
          plural: \'A bunch of things here\'
        }"></trans>'

  beforeEach ->
    module 'jed'

    inject (_$rootScope_, _$compile_, i18n) ->
      $rootScope = _$rootScope_
      compile = _$compile_

      i18n._setTranslations translations
          .setLang 'fr_FR'

  it 'should perform a simple translation for a tag', ->
    scope = $rootScope.$new()
    element = compile(simpleTrans)(scope)
    scope.$digest()
    expect(element.html()).toContain('Ceci est un test')

  it 'should perform a simple translation with trans attribute', ->
    scope = $rootScope.$new()
    element = compile('<div id="test">' + transAttr + '</div>')(scope)
    scope.$digest()
    expect(element.html()).toEqual('<h1 trans="">Ceci est un test</h1>')

  it 'should perform a translation with variable', ->
    scope = $rootScope.$new()
    scope.username = 'Michael Jackson'
    element = compile(variableTrans)(scope)
    scope.$digest()
    expect(element.html()).toContain("Michael Jackson n'est pas un test")

  it 'should update the translation after a variable changed', ->
    scope = $rootScope.$new()
    scope.username = 'Michael Jackson'
    element = compile('<trans>{{ username }} is not a test</trans>')(scope)
    scope.$digest()
    scope.username = 'John Travolta'
    scope.$digest()
    expect(element.html()).toContain("John Travolta n'est pas un test")

  it 'should perform a plural translation and watch the count', ->
    scope = $rootScope.$new()
    scope.nbr = 0
    element = compile(pluralTrans)(scope)
    scope.$digest()
    expect(element.html()).toContain('Rien a voir ici')
    scope.nbr = 1
    scope.$digest()
    expect(element.html()).toContain('Un truc ici')
    scope.nbr = 10
    scope.$digest()
    expect(element.html()).toContain('Un tas de trucs ici')
