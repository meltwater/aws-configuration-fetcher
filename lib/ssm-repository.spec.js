import test, { beforeEach } from 'ava'
import td from 'testdouble'

import createLogger from '@meltwater/mlabs-logger'
import { SsmRepository } from './ssm-repository'
import { SSM } from 'aws-sdk'

beforeEach((t) => {
  const ssmClient = new SSM()
  t.context.options = {
    log: createLogger({ t }),
    ssmClient
  }
})

test('should throw if ssm client is not an AWS SSM client', (t) => {
  t.throws(() => new SsmRepository({ log: t.log, ssmClient: null }), {
    message: /instance of SSM/i
  })
})

test('getParameter should throw if parameterPath is not a string', async (t) => {
  const ssmRepository = new SsmRepository(t.context.options)

  await t.throwsAsync(() => ssmRepository.getParameter(1234), {
    message: /parameterPath.*string/i
  })
})

test('getParameter should throw if ssmClient throws', async (t) => {
  const options = t.context.options
  td.replace(options.ssmClient, 'getParameter', () => ({
    promise: () => Promise.reject(new Error('boom'))
  }))

  const ssmRepository = new SsmRepository(options)

  await t.throwsAsync(() => ssmRepository.getParameter('something valid'), {
    message: /boom/i
  })
})

test('getParameter should map parameterPath to getParameter options', async (t) => {
  t.plan(1)
  const options = t.context.options
  td.replace(options.ssmClient, 'getParameter', (input) => ({
    promise: () => {
      t.snapshot(input)
      return Promise.resolve({ Parameter: {} })
    }
  }))

  const ssmRepository = new SsmRepository(options)

  await ssmRepository.getParameter('something valid')
})

test('getParameter should map response to type and value', async (t) => {
  const ssmResponse = {
    Parameter: {
      Value: '🙅‍♂️'
    }
  }
  const options = t.context.options
  td.replace(options.ssmClient, 'getParameter', () => ({
    promise: () => {
      return Promise.resolve(ssmResponse)
    }
  }))

  const ssmRepository = new SsmRepository(options)

  const result = await ssmRepository.getParameter('something valid')

  t.is(result, ssmResponse.Parameter.Value)
})
