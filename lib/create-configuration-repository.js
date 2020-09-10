import cacheManager from 'cache-manager'
import { AWS } from './get-instrumented-aws'
import { CachedConfigurationRepository } from './cached-configuration-repository'
import { ConfigurationRepository } from './configuration-repository'
import { NoopLogger } from './noop-logger'
import { SsmRepository } from './ssm-repository'
import { SecretsRepository } from './secrets-repository'

const maxParameterCount = 10
const memoryCacheTtlInSeconds = 60

/**
 * Create a new instance of a ConfigurationRepository
 *
 * @param {object} [options] - See below
 * @param {cacheManager} [options.cache] - An instance of a cache from the npm package 'cache-manager'. Defaults to in memory cache
 * @param {string} [options.cacheKey] - A key used to isolate the configuration cache from other cache namespaces. Defaults to 'configuration'
 * @param {string} [options.log] - A pino compatible logger. Defaults to a noop logger
 *
 * @returns {ConfigurationRepository} The configuration repository
 */
export function createConfigurationRepository(options) {
  const {
    log = new NoopLogger(),
    cache = cacheManager.caching({
      store: 'memory',
      max: maxParameterCount,
      ttl: memoryCacheTtlInSeconds
    }),
    cacheKey = 'configuration'
  } = options

  const ssmRepository = new SsmRepository({ log, ssmClient: new AWS.SSM() })
  const secretsRepository = new SecretsRepository({
    log,
    smClient: new AWS.SecretsManager()
  })
  const configurationRepository = new ConfigurationRepository({
    log,
    secretsRepository,
    ssmRepository
  })
  return new CachedConfigurationRepository({
    log,
    cache,
    cacheKey,
    configurationRepository
  })
}
