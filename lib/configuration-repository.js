import ac from 'argument-contracts'
import { argName } from 'argument-contracts/arg-name'
import { ConfigurationRequest } from './configuration-request'
import { ConfigurationRequestTypes } from './configuration-request-type'

/**
 * THIS IS NOT INTENDED TO BE CONSTRUCTED BY HAND. Please use createConfigurationRepository
 *
 * @param {object} options - Internal use
 * @param {object} options.log - Internal use
 * @param {object} options.ssmRepository - Internal use
 * @param {object} options.secretsRepository - Internal use
 */
export class ConfigurationRepository {
  constructor({ log, ssmRepository, secretsRepository }) {
    ac.assertFunction(ssmRepository.getParameter, argName({ ssmRepository }))
    ac.assertFunction(
      secretsRepository.getSecret,
      argName({ secretsRepository })
    )

    this._log = log.child({ class: argName({ ConfigurationRepository }) })
    this._ssmRepository = ssmRepository
    this._secretsRepository = secretsRepository
  }

  _getValue(configurationRequest) {
    if (configurationRequest.type === ConfigurationRequestTypes.local) {
      return configurationRequest.key
    }

    if (configurationRequest.type === ConfigurationRequestTypes.secret) {
      return this._secretsRepository.getSecret(configurationRequest.key)
    }

    if (configurationRequest.type === ConfigurationRequestTypes.ssm) {
      return this._ssmRepository.getParameter(configurationRequest.key)
    }

    throw new Error(
      `Unsupported ConfigurationRequestTypes ${configurationRequest.type}`
    )
  }

  async _handlerConfigurationRequest(configurationRequest) {
    const log = this._log.child({
      meta: {
        key: configurationRequest.key,
        propertyName: configurationRequest.propertyName,
        type: configurationRequest.type
      }
    })
    try {
      log.info('start: _handlerConfigurationRequest')
      const value = await this._getValue(configurationRequest)

      log.debug('end: _handlerConfigurationRequest')
      return {
        propertyName: configurationRequest.propertyName,
        value: configurationRequest.adapter(value)
      }
    } catch (err) {
      log.error({ err }, 'fail: _handlerConfigurationRequest')
      throw err
    }
  }

  /**
   * Get a configuration object based on a provided array of configuration requests
   *
   * @param {Array<ConfigurationRequest>} arrayOfConfigurationRequests
   * @returns {object} - An object with properties based on the ConfigurationRequest objects provided and values of the adapter configuration responses
   */
  async getConfiguration(arrayOfConfigurationRequests) {
    try {
      this._log.info('start: getConfiguration')
      validateConfigurationRequests(arrayOfConfigurationRequests)

      const allRequests = arrayOfConfigurationRequests.map(
        this._handlerConfigurationRequest.bind(this)
      )

      const configuration = {}
      const allResponses = await Promise.all(allRequests)
      allResponses.forEach((response) => {
        configuration[response.propertyName] = response.value
      })

      this._log.debug('end: getConfiguration')
      return configuration
    } catch (err) {
      this._log.error({ err }, 'fail: getConfiguration')
      throw err
    }
  }
}

function validateConfigurationRequests(arrayOfConfigurationRequests) {
  ac.assertArrayOf(
    arrayOfConfigurationRequests,
    ConfigurationRequest,
    argName({ arrayOfSsmConfigurationRequests: arrayOfConfigurationRequests })
  )

  const propertyNameMap = {}
  for (const configurationRequest of arrayOfConfigurationRequests) {
    if (propertyNameMap[configurationRequest.propertyName]) {
      throw new Error(
        `Duplicate propertyName detected in configuration array. Duplicated propertyName: ${configurationRequest.propertyName}`
      )
    }
    propertyNameMap[configurationRequest.propertyName] =
      configurationRequest.propertyName
  }
}
