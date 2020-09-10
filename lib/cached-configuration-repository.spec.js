import test, { beforeEach } from 'ava'
import td from 'testdouble'

import { NoopLogger } from './noop-logger'
import { CachedConfigurationRepository } from './cached-configuration-repository'
import { ConfigurationRepository } from './configuration-repository'

beforeEach((t) => {
  const log = new NoopLogger()
  const ssmRepository = {
    getParameter: () => { }
  }
  const secretsRepository = {
    getSecret: () => { }
  }
  const configurationRepository = new ConfigurationRepository({
    log,
    ssmRepository,
    secretsRepository
  })
  const getConfigurationFake = td.func('getConfigurationFake')
  td.replace(configurationRepository, 'getConfiguration', getConfigurationFake)

  const cache = {
    wrap: (_, cb) => cb()
  }

  t.context = {
    getConfigurationFake: getConfigurationFake,
    log,
    cache,
    cacheKey: 'hello!',
    configurationRepository
  }
})

test('should get configuration from downstream service', async (t) => {
  const configurationRequests = ['yay for configuration']
  const cachedConfigurationRepository = new CachedConfigurationRepository(
    t.context
  )

  await cachedConfigurationRepository.getConfiguration(configurationRequests)

  td.verify(t.context.getConfigurationFake(configurationRequests))
  t.pass()
})

test('should use constructor cacheKey parameter as the cache key', async (t) => {
  const cacheKey = 'yay!'
  const configurationRequests = ['yay for configuration']
  const wrapFake = td.func('wrap')
  const cachedConfigurationRepository = new CachedConfigurationRepository({
    ...t.context,
    cache: {
      wrap: wrapFake
    },
    cacheKey
  })

  await cachedConfigurationRepository.getConfiguration(configurationRequests)

  td.verify(wrapFake(cacheKey, td.matchers.anything()))
  t.pass()
})

test('should return value from wrapped cache', async (t) => {
  const expectedResult = 'So predictable'
  td.when(t.context.getConfigurationFake(td.matchers.anything())).thenReturn(
    expectedResult
  )
  const configurationRequests = ['yay for configuration']
  const cachedConfigurationRepository = new CachedConfigurationRepository(
    t.context
  )

  const result = await cachedConfigurationRepository.getConfiguration(
    configurationRequests
  )

  t.is(result, expectedResult)
})
