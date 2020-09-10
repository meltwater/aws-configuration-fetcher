import ac from 'argument-contracts'
import { argName } from 'argument-contracts/arg-name'
import { SecretsManager } from 'aws-sdk'

export class SecretsRepository {
  constructor({ log, smClient }) {
    if (!(smClient instanceof SecretsManager)) {
      throw new TypeError(
        `smClient must be an instance of SecretsManager. Provided value: ${smClient}`
      )
    }
    this._log = log.child({ class: argName({ SecretsRepository }) })
    this._smClient = smClient
  }

  async getSecret(secretId) {
    const log = this._log.child({ secretId })
    log.info('start: getSecret')

    ac.assertString(secretId, argName({ secretId }))

    try {
      const smResult = await this._smClient
        .getSecretValue({
          SecretId: secretId
        })
        .promise()

      log.info('end: getSecret')
      log.debug({ data: smResult }, 'end: getSecret')
      return smResult.SecretString
    } catch (err) {
      log.error({ err }, 'fail: getSecret')
      throw err
    }
  }
}
