import ac from 'argument-contracts'
import { argName } from 'argument-contracts/arg-name'
import { ConfigurationRepository } from './configuration-repository'

export class CachedConfigurationRepository {
  constructor({ log, cache, cacheKey, configurationRepository }) {
    ac.assertString(cacheKey, argName({ cacheKey }))
    ac.assertType(
      configurationRepository,
      ConfigurationRepository,
      argName({ configurationRepository })
    )

    this._log = log.child({ class: argName({ CachedConfigurationRepository }) })
    this._cache = cache
    this._cacheKey = cacheKey
    this._configurationRepository = configurationRepository
  }

  async getConfiguration(arrayOfSsmConfigurationRequests) {
    this._log.info({ cacheKey: this._cacheKey }, 'start: getConfiguration')

    return this._cache.wrap(this._cacheKey, () =>
      this._configurationRepository.getConfiguration(
        arrayOfSsmConfigurationRequests
      )
    )
  }
}
