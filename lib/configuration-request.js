import ac from 'argument-contracts'
import { argName } from 'argument-contracts/arg-name'
import { ConfigurationRequestTypes } from './configuration-request-type'

export class ConfigurationRequest {
  constructor({ adapter = (x) => x, key, propertyName, type }) {
    ac.assertFunction(adapter, argName({ adapter }))
    ac.assertString(key, argName({ key }))
    ac.assertString(propertyName, argName({ propertyName }))
    if (!ConfigurationRequestTypes.isValid(type)) {
      throw new TypeError(
        `type must be a valid ConfigurationRequestTypes entry. Provided value: ${JSON.stringify(
          type
        )}`
      )
    }

    this.adapter = adapter
    this.key = key
    this.propertyName = propertyName
    this.type = type

    Object.freeze(this)
  }
}
