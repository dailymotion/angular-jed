'use strict'

describe 'trans filter', ->
  compile = $rootScope = i18n = null

  simpleTrans = '<span>{{ "This is a test"|trans }}</span>'
  variableTrans = '{{ username }} is not a test'
  pluralTrans = '<span>{{ "One thing here"|trans:{plural: "A bunch of things here", count: nbr, none: "Nothing to see here"} }}</span>'
  variablePluralTrans = '<span>{{ "%user% has one apple"|trans:{plural: "%user% has %nbr% apples", count: nbr, none: "%user% has no apple", placeholders: {user: user, nbr: nbr} } }}</span>'
  singularTransController = '{{ user }} has one apple'
  pluralTransController = '{{ user }} has {{ nbr }} apples'

  beforeEach ->
    module 'jed'

    inject (_$rootScope_, _$compile_, _i18n_) ->
      $rootScope = _$rootScope_
      compile = _$compile_
      i18n = _i18n_

      _i18n_.setLang 'fr_FR'
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

  it 'should work in controllers', ->
    scope = $rootScope.$new()
    scope.username = 'Zakk Wylde'
    scope.nbr = 10
    result = i18n._ variableTrans, scope
    expect(result).toEqual("Zakk Wylde n'est pas un test")
    resultPlural = i18n._n singularTransController, pluralTransController, scope.nbr, {user: scope.username, nbr: scope.nbr }
    expect(resultPlural).toEqual('Zakk Wylde a 10 pommes')
