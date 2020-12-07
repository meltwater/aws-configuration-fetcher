/**
 * The available types of configuration requests
 */
const configurationRequestTypes = {
  /**
   * Local
   */
  local: 'local',
  /**
   * Secrets manager
   */
  secret: 'secret',
  /**
   * SSM
   */
  ssm: 'ssm'
}
/**
 * configurationRequestTypes accessor object
 **/
export const ConfigurationRequestTypes = {
  ...configurationRequestTypes,
  /**
   * Check to see if a given string is a valid ConfigurationRequestTypes
   *
   * @param {string} possibleType - Possible ConfigurationRequestTypes
   * @returns {boolean} - True for value, false for invalid
   */
  isValid: (possibleType) => {
    return Object.values(configurationRequestTypes).includes(possibleType)
  }
}
