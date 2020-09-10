import ac from 'argument-contracts'
import { argName } from 'argument-contracts/arg-name'
import { SSM } from 'aws-sdk'

export class SsmRepository {
  constructor({ log, ssmClient }) {
    if (!(ssmClient instanceof SSM)) {
      throw new TypeError(
        `ssmClient must be an instance of SSM. Provided value: ${ssmClient}`
      )
    }
    this._log = log.child({ class: argName({ SsmRepository }) })
    this._ssmClient = ssmClient
  }

  async getParameter(parameterPath) {
    const log = this._log.child({ parameterPath })
    log.info('start: getParameter')

    ac.assertString(parameterPath, argName({ parameterPath }))

    try {
      const ssmResult = await this._ssmClient
        .getParameter({
          Name: parameterPath
        })
        .promise()

      log.info('end: getParameter')
      log.debug({ data: ssmResult }, 'end: getParameter')
      return ssmResult.Parameter.Value
    } catch (err) {
      log.error({ err }, 'fail: getParameter')
      throw err
    }
  }
}
