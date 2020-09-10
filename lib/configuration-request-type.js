/**
 * The available types of configuration requests
 */
const configurationRequestTypes = {
  /**
   * Secrets manager
   */
  secret: 'secret',
  /**
   * SSM
   */
  ssm: 'ssm'
}

export const ConfigurationRequestTypes = {
  ...configurationRequestTypes,
  isValid: (possibleType) => {
    return Object.values(configurationRequestTypes).includes(possibleType)
  }
}
