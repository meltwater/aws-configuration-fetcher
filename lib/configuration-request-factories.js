import ac from 'argument-contracts'

import { ConfigurationRequest } from './configuration-request'
import { ConfigurationRequestTypes } from './configuration-request-type'

export const createSsmStringConfigurationRequest = (propertyName, key) =>
  new ConfigurationRequest({
    adapter: (value) => {
      ac.assertNonWhiteSpaceString(value, propertyName)
      return value
    },
    key,
    propertyName,
    type: ConfigurationRequestTypes.ssm
  })
