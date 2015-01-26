'use strict'

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
  variablePluralTrans = '<trans count="nbr"
        when="{
          0: \'{{ user }} has no apple\',
          one: \'{{ user }} has one apple\',
          plural: \'{{ user }} has {{ nbr }} apples\'
        }"></trans>'

  beforeEach ->
    module 'jed'

    inject (_$rootScope_, _$compile_, i18n) ->
      $rootScope = _$rootScope_
      compile = _$compile_

      i18n.setLang 'fr_FR'
          .loadPage 'main'

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
    element = compile(variableTrans)(scope)
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

  it 'should perform a plural translation with variable and watch the count', ->
    scope = $rootScope.$new()
    scope.nbr = 0
    scope.user = 'Christian Bale'
    element = compile(variablePluralTrans)(scope)
    scope.$digest()
    expect(element.html()).toContain("Christian Bale n'a aucune pomme")
    scope.nbr = 1
    scope.$digest()
    expect(element.html()).toContain('Christian Bale a une pomme')
    scope.nbr = 10
    scope.$digest()
    expect(element.html()).toContain('Christian Bale a 10 pommes')
