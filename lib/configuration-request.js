import ac from 'argument-contracts'
import { argName } from 'argument-contracts/arg-name'
import { ConfigurationRequestTypes } from './configuration-request-type'

/**
 * A request for a configuration value
 *
 * @param {object} options - See below
 * @param {Function} [options.adapter] - A function that will be passed the raw value and be allowed to modify it before returning
 * @param {string} options.key - The key for the requested configuration. For SSM the parameter path, for Secrets manager the secret name.
 * @param {string} options.propertyName - The property name the value will be assigned to in the response object from getting configuration
 * @param {ConfigurationRequestTypes} options.type - The type of configuration request
 */
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
