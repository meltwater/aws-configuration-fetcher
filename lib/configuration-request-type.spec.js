import test from 'ava'

import { ConfigurationRequestTypes } from './configuration-request-type'

test('isValid should return true for valid configuration type', (t) => {
  t.true(ConfigurationRequestTypes.isValid(ConfigurationRequestTypes.secret))
})

test('isValid should return false for invalid items', (t) => {
  t.false(ConfigurationRequestTypes.isValid({}))
  t.false(ConfigurationRequestTypes.isValid(1234))
  t.false(ConfigurationRequestTypes.isValid([]))
  t.false(ConfigurationRequestTypes.isValid('hooray'))
  t.false(ConfigurationRequestTypes.isValid(Symbol('what?')))
  t.false(ConfigurationRequestTypes.isValid(false))
})
