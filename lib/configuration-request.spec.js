import test, { beforeEach } from 'ava'

import { ConfigurationRequest } from './configuration-request'
import { ConfigurationRequestTypes } from './configuration-request-type'

beforeEach((t) => {
  t.context = {
    adapter: (yas) => `${yas}yas`,
    key: '/so/much/key',
    propertyName: 'wicked props',
    type: ConfigurationRequestTypes.ssm
  }
})

test('should not throw if adapter is not provided', (t) => {
  t.notThrows(
    () =>
      new ConfigurationRequest({
        ...t.context,
        adapter: undefined
      })
  )
})

test('should default adapter to a pass through if one is not provided', (t) => {
  const valueToAdapt = 'This should not be changed'
  const ssmConfigurationRequest = new ConfigurationRequest({
    ...t.context,
    adapter: undefined
  })

  t.is(ssmConfigurationRequest.adapter(valueToAdapt), valueToAdapt)
})

test('should throw if adapter is provided but not a function', (t) => {
  t.throws(
    () =>
      new ConfigurationRequest({
        ...t.context,
        adapter: 1234
      }),
    { message: /adapter.*function/ }
  )
})

test('should throw if key is not a string', (t) => {
  t.throws(
    () =>
      new ConfigurationRequest({
        ...t.context,
        key: 1234
      }),
    { message: /key.*string/ }
  )
})

test('should throw if propertyName is not a string', (t) => {
  t.throws(
    () =>
      new ConfigurationRequest({
        ...t.context,
        propertyName: 1234
      }),
    { message: /propertyName.*string/ }
  )
})

test('should throw if type is not a valid ConfigurationRequestType', (t) => {
  t.throws(
    () =>
      new ConfigurationRequest({
        ...t.context,
        propertyName: 1234
      }),
    { message: /propertyName.*string/ }
  )
})

test('should map properties from params', (t) => {
  const result = new ConfigurationRequest(t.context)

  t.is(result.adapter, t.context.adapter)
  t.is(result.key, t.context.key)
  t.is(result.propertyName, t.context.propertyName)
})

test('should be immutable', (t) => {
  const result = new ConfigurationRequest(t.context)

  t.throws(() => {
    result.adapter = 1234
  })
  t.throws(() => {
    result.key = 1234
  })
  t.throws(() => {
    result.propertyName = 1234
  })
})

test('should be createable from itself', (t) => {
  const resultOne = new ConfigurationRequest(t.context)
  const resultTwo = new ConfigurationRequest(resultOne)

  t.is(resultOne.adapter, resultTwo.adapter)
  t.is(resultOne.key, resultTwo.key)
  t.is(resultOne.propertyName, resultTwo.propertyName)
})
