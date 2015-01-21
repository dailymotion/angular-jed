'use strict'

describe 'trans filter', ->
  compile = $rootScope = null

  simpleTrans = '<span>{{ "This is a test"|trans }}</span>'
  pluralTrans = '<span>{{ "Nothing to see here"|trans:{plural: "A bunch of things here", count: nbr, none: "Nothing to see here"} }}</span>'
  variablePluralTrans = '<span>{{ "%user% has one apple"|trans:{plural: "%user% has %nbr% apples", count: nbr, none: "%user% has no apple", placeholders: {user: user, nbr: nbr} } }}</span>'

  beforeEach ->
    module 'jed'

    inject (_$rootScope_, _$compile_, i18n) ->
      $rootScope = _$rootScope_
      compile = _$compile_

      i18n.setLang 'fr_FR'
          .loadPage 'main'

  it 'should perform a simple translation', ->
    scope = $rootScope.$new()
    element = compile(simpleTrans)(scope)
    scope.$digest()
    expect(element.html()).toContain('Ceci est un test')

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
