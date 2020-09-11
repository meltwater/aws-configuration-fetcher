import test, { before, beforeEach } from 'ava'
import td from 'testdouble'

import { ConfigurationRepository } from './configuration-repository'
import { SecretsRepository } from './secrets-repository'
import { SsmRepository } from './ssm-repository'
import { NoopLogger } from './noop-logger'
import { SecretsManager, SSM } from 'aws-sdk'
import { ConfigurationRequest } from './configuration-request'

before(() => {
  td.config({ ignoreWarnings: true })
})

beforeEach((t) => {
  const log = new NoopLogger()
  const ssmRepository = new SsmRepository({ log, ssmClient: new SSM() })
  const secretsRepository = new SecretsRepository({
    log,
    smClient: new SecretsManager()
  })

  t.context = {
    log,
    ssmRepository,
    secretsRepository
  }
})

test('should throw if ssmRepository does not have a getParameter method', (t) => {
  t.throws(
    () =>
      new ConfigurationRepository({
        ...t.context,
        ssmRepository: {}
      }),
    {
      message: /ssmRepository/i
    }
  )
})

test('getConfiguration should throw if provided requests are not valid', async (t) => {
  const configurationRepository = new ConfigurationRepository(t.context)

  await t.throwsAsync(() => configurationRepository.getConfiguration({}), {
    message: /arrayOfSsmConfigurationRequests/i
  })
  await t.throwsAsync(() => configurationRepository.getConfiguration([1234]), {
    message: /arrayOfSsmConfigurationRequests/i
  })

  await t.throwsAsync(() => configurationRepository.getConfiguration([{}]), {
    message: /arrayOfSsmConfigurationRequests/i
  })
})

test('getConfiguration should throw if more multiple requests use the same propertyName', async (t) => {
  const configurationRepository = new ConfigurationRepository(t.context)
  const fakeGetParameter = td.func('fakeGetParameter')
  td.when(fakeGetParameter(td.matchers.anything())).thenReturn('yay')
  td.replace(t.context.ssmRepository, 'getParameter', fakeGetParameter)

  const configurationRequests = [
    {
      adapter: (x) => x,
      key: 'woot/woot/woot',
      propertyName: 'winner',
      type: 'ssm'
    },
    {
      adapter: (x) => x,
      key: 'yes/yes/yes',
      propertyName: 'winner',
      type: 'secret'
    }
  ]

  await t.throwsAsync(
    () => configurationRepository.getConfiguration(configurationRequests),
    { message: /duplicate propertyName/i }
  )
})

test('getConfiguration should get all requested ssm parameters', async (t) => {
  const configurationRepository = new ConfigurationRepository(t.context)
  const fakeGetParameter = td.func('fakeGetParameter')
  td.when(fakeGetParameter(td.matchers.anything())).thenReturn('yay')
  td.replace(t.context.ssmRepository, 'getParameter', fakeGetParameter)

  const configurationRequests = [
    {
      adapter: (x) => x,
      key: 'woot/woot/woot',
      propertyName: 'winner',
      type: 'ssm'
    },
    {
      adapter: (x) => x,
      key: 'yes/yes/yes',
      propertyName: 'successor',
      type: 'ssm'
    }
  ]

  await configurationRepository.getConfiguration(configurationRequests)

  td.verify(fakeGetParameter(configurationRequests[0].key))
  td.verify(fakeGetParameter(configurationRequests[1].key))
  t.pass()
})

test('getConfiguration should get all requested secrets', async (t) => {
  const configurationRepository = new ConfigurationRepository(t.context)
  const fakeGetSecret = td.func('fakeGetSecret')
  td.when(fakeGetSecret(td.matchers.anything())).thenReturn('yay')
  td.replace(t.context.secretsRepository, 'getSecret', fakeGetSecret)

  const configurationRequests = [
    {
      adapter: (x) => x,
      key: 'woot/woot/woot',
      propertyName: 'winner',
      type: 'secret'
    },
    {
      adapter: (x) => x,
      key: 'yes/yes/yes',
      propertyName: 'successor',
      type: 'secret'
    }
  ]

  await configurationRepository.getConfiguration(configurationRequests, t)

  td.verify(fakeGetSecret(configurationRequests[0].key))
  td.verify(fakeGetSecret(configurationRequests[1].key))
  t.pass()
})

test('getConfiguration should adapt all responses', async (t) => {
  const configurationRepository = new ConfigurationRepository(t.context)
  const fakeGetParameter = td.func('fakeGetParameter')
  const responseOne = 'yay'
  const responseTwo = 'boo'
  td.when(fakeGetParameter(td.matchers.anything())).thenReturn(responseOne)
  td.replace(t.context.ssmRepository, 'getParameter', fakeGetParameter)
  const fakeGetSecret = td.func('fakeGetSecret')
  td.when(fakeGetSecret(td.matchers.anything())).thenReturn(responseTwo)
  td.replace(t.context.secretsRepository, 'getSecret', fakeGetSecret)

  const configurationRequests = [
    {
      adapter: td.func(),
      key: 'woot/woot/woot',
      propertyName: 'winner',
      type: 'ssm'
    },
    {
      adapter: td.func(),
      key: 'yes/yes/yes',
      propertyName: 'successor',
      type: 'secret'
    }
  ]

  await configurationRepository.getConfiguration(configurationRequests)

  td.verify(configurationRequests[0].adapter(responseOne))
  td.verify(configurationRequests[1].adapter(responseTwo))
  t.pass()
})

test('getConfiguration should map responses to their property names', async (t) => {
  const configurationRepository = new ConfigurationRepository(t.context)
  const fakeGetParameter = td.func('fakeGetParameter')
  const responseOne = 'yay'
  const responseTwo = 'boo'
  td.when(fakeGetParameter(td.matchers.anything())).thenReturn(responseOne)
  td.replace(t.context.ssmRepository, 'getParameter', fakeGetParameter)
  const fakeGetSecret = td.func('fakeGetSecret')
  td.when(fakeGetSecret(td.matchers.anything())).thenReturn(responseTwo)
  td.replace(t.context.secretsRepository, 'getSecret', fakeGetSecret)

  const configurationRequests = [
    {
      adapter: (x) => x,
      key: 'woot/woot/woot',
      propertyName: 'the number one property',
      type: 'ssm'
    },
    {
      adapter: (x) => x,
      key: 'yes/yes/yes',
      propertyName: 'I will not be called number 2',
      type: 'secret'
    }
  ]

  const result = await configurationRepository.getConfiguration(
    configurationRequests
  )

  t.is(result[configurationRequests[0].propertyName], responseOne)
  t.is(result[configurationRequests[1].propertyName], responseTwo)
})

test('should return responses in a consistent format', async (t) => {
  const configurationRepository = new ConfigurationRepository(t.context)
  const fakeGetParameter = td.func('fakeGetParameter')
  const responseOne = 'somePropertyValue'
  const responseTwo = 'someOtherPropertyValue'
  td.when(fakeGetParameter(td.matchers.anything())).thenReturn(responseOne)
  td.replace(t.context.ssmRepository, 'getParameter', fakeGetParameter)
  const fakeGetSecret = td.func('fakeGetSecret')
  td.when(fakeGetSecret(td.matchers.anything())).thenReturn(responseTwo)
  td.replace(t.context.secretsRepository, 'getSecret', fakeGetSecret)

  const configurationRequests = [
    new ConfigurationRequest({
      adapter: (x) => x,
      key: 'woot/woot/woot',
      propertyName: 'someProperty',
      type: 'ssm'
    }),
    new ConfigurationRequest({
      adapter: (x) => x,
      key: 'yes/yes/yes',
      propertyName: 'somOtherProperty',
      type: 'secret'
    })
  ]

  const result = await configurationRepository.getConfiguration(
    configurationRequests
  )

  t.snapshot(result, 'Response format')
})
