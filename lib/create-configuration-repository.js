import cacheManager from 'cache-manager'
import { AWS } from './get-instrumented-aws'
import { CachedConfigurationRepository } from './cached-configuration-repository'
import { ConfigurationRepository } from './configuration-repository'
import { SsmRepository } from './ssm-repository'
import { SecretsRepository } from './secrets-repository'

export function createConfigurationRepository({
  log,
  maxParameterCount = 10,
  memoryCacheTtlInSeconds = 60,
  cacheKey
}) {
  const memoryCache = cacheManager.caching({
    store: 'memory',
    max: maxParameterCount,
    ttl: memoryCacheTtlInSeconds
  })
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
    cache: memoryCache,
    cacheKey,
    configurationRepository
  })
}
