/* eslint-disable class-methods-use-this */
export class NoopLogger {
  child() {
    return this
  }

  debug() {}

  error() {}

  info() {}

  warn() {}
}
