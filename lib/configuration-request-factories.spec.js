import test from 'ava'

import {
  createLocalStringConfigurationRequest,
  createSecretStringConfigurationRequest,
  createSsmStringConfigurationRequest
} from './configuration-request-factories'

test('createLocalStringConfigurationRequest', (t) => {
  t.snapshot(createLocalStringConfigurationRequest('theName', 'the/path'))
})

test('createSecretStringConfigurationRequest', (t) => {
  t.snapshot(createSecretStringConfigurationRequest('theName', 'the/path'))
})

test('createSsmStringConfigurationRequest', (t) => {
  t.snapshot(createSsmStringConfigurationRequest('theName', 'the/path'))
})

test('createLocalStringConfigurationRequest.adapter', (t) => {
  const req = createLocalStringConfigurationRequest('theName', 'the/path')
  t.is(req.adapter('foo'), 'foo')
  t.throws(() => req.adapter(''))
  t.throws(() => req.adapter(4))
  t.throws(() => req.adapter(null))
})

test('createSecretStringConfigurationRequest.adapter', (t) => {
  const req = createSecretStringConfigurationRequest('theName', 'the/path')
  t.is(req.adapter('foo'), 'foo')
  t.throws(() => req.adapter(''))
  t.throws(() => req.adapter(4))
  t.throws(() => req.adapter(null))
})

test('createSsmStringConfigurationRequest.adapter', (t) => {
  const req = createSsmStringConfigurationRequest('theName', 'the/path')
  t.is(req.adapter('foo'), 'foo')
  t.throws(() => req.adapter(''))
  t.throws(() => req.adapter(4))
  t.throws(() => req.adapter(null))
})
