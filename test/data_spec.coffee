'use strict'

describe 'trans filter', ->
  compile = $rootScope = i18n = null

  simpleTrans = 'This is a test'
  headerTrans = 'This is a translation from the header'
  secondaryTrans = 'More translations here'

  beforeEach ->
    module 'jed'

    inject (_$rootScope_, _$compile_, _i18n_) ->
      $rootScope = _$rootScope_
      compile = _$compile_
      i18n = _i18n_

      i18n.setLang 'fr_FR'

  it 'should work in controllers', ->
    i18n.loadPage('main').then ->
      result = i18n._ simpleTrans
      expect(result).toEqual 'Ceci est un test'

  it 'should work with common datas', ->
    i18n.loadCommon('header').then ->
      resultHeader = i18n._ headerTrans
      result = i18n._ simpleTrans
      expect(resultHeader).toEqual 'Ceci est une traduction du header'
      expect(result).toEqual 'Ceci est un test'

  it 'should work with another page', ->
    i18n.loadPage('secondary').then ->
      result = i18n._ secondaryTrans
      expect(result).toEqual 'Plus de traductions ici'
