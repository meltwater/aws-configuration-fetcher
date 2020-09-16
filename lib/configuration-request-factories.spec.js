import test from 'ava'

import { createSsmStringConfigurationRequest } from './configuration-request-factories'

test('createSsmStringConfigurationRequest', (t) => {
  t.snapshot(createSsmStringConfigurationRequest('theName', 'the/path'))
})

test('createSsmStringConfigurationRequest.adapter', (t) => {
  const req = createSsmStringConfigurationRequest('theName', 'the/path')
  t.is(req.adapter('foo'), 'foo')
  t.throws(() => req.adapter(''))
  t.throws(() => req.adapter(4))
  t.throws(() => req.adapter(null))
})
