import test, { beforeEach } from 'ava'
import td from 'testdouble'

import { NoopLogger } from './noop-logger'
import { SecretsRepository } from './secrets-repository'
import { SecretsManager } from 'aws-sdk'

beforeEach((t) => {
  const smClient = new SecretsManager()
  t.context.options = {
    log: new NoopLogger(),
    smClient: smClient
  }
})

test('should throw if secrets manager client is not an AWS SecretsManager client', (t) => {
  t.throws(() => new SecretsRepository({ log: t.log, smClient: null }), {
    message: /instance of SecretsManager/i
  })
})

test('getSecret should throw if secretId is not a string', async (t) => {
  const secretsRepository = new SecretsRepository(t.context.options)

  await t.throwsAsync(() => secretsRepository.getSecret(1234), {
    message: /secretId.*string/i
  })
})

test('getSecret should throw if smClient throws', async (t) => {
  const options = t.context.options
  td.replace(options.smClient, 'getSecretValue', () => ({
    promise: () => Promise.reject(new Error('boom'))
  }))

  const secretsRepository = new SecretsRepository(options)

  await t.throwsAsync(() => secretsRepository.getSecret('something valid'), {
    message: /boom/i
  })
})

test('getSecret should map parameterPath to getSecretValue options', async (t) => {
  t.plan(1)
  const options = t.context.options
  td.replace(options.smClient, 'getSecretValue', (input) => ({
    promise: () => {
      t.snapshot(input)
      return Promise.resolve({ SecretString: 'yay' })
    }
  }))

  const secretsRepository = new SecretsRepository(options)

  await secretsRepository.getSecret('something valid')
})

test('getSecret should map response to type and value', async (t) => {
  const ssmResponse = {
    SecretString: '🙅‍♂️'
  }
  const options = t.context.options
  td.replace(options.smClient, 'getSecretValue', () => ({
    promise: () => {
      return Promise.resolve(ssmResponse)
    }
  }))

  const secretsRepository = new SecretsRepository(options)

  const result = await secretsRepository.getSecret('something valid')

  t.is(result, ssmResponse.SecretString)
})
