import AWSXRay from 'aws-xray-sdk-core'
import UninstrumentedAWS from 'aws-sdk'

let resolvedAWS
// UPSTREAM - Needed to use serverless_offline plugin
// https://github.com/dherault/serverless-offline/issues/327
if (process.env._X_AMZN_TRACE_ID) {
  resolvedAWS = AWSXRay.captureAWS(UninstrumentedAWS)
} else {
  // eslint-disable-next-line no-console
  console.log('Running without x-ray tracing...')
  resolvedAWS = UninstrumentedAWS
}

export const AWS = resolvedAWS
